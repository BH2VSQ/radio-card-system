const Card = require('../models/card.model');
const Certificate = require('../models/certificate.model');
const CertificateTemplate = require('../models/certificateTemplate.model');
const { createError } = require('../utils/error.util');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const moment = require('moment');

/**
 * @desc    生成EYEBALL卡证书
 * @route   POST /api/certificates/eyeball/:cardId
 * @access  Private
 */
exports.generateEyeballCertificate = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { templateId, title, description, additionalInfo, isPublic } = req.body;
    
    // 查找卡片
    const card = await Card.findOne({
      _id: cardId,
      userId: req.user.id
    });
    
    if (!card) {
      return next(createError(404, '卡片不存在'));
    }
    
    // 检查是否是EYEBALL卡
    if (!card.eyeballInfo || !card.eyeballInfo.isEyeball) {
      return next(createError(400, '该卡片不是EYEBALL卡'));
    }
    
    // 查找证书模板
    let template;
    if (templateId) {
      template = await CertificateTemplate.findById(templateId);
      if (!template) {
        return next(createError(404, '证书模板不存在'));
      }
    } else {
      // 使用默认EYEBALL证书模板
      template = await CertificateTemplate.findOne({
        type: 'eyeball',
        isDefault: true
      });
      
      if (!template) {
        return next(createError(404, '未找到默认EYEBALL证书模板'));
      }
    }
    
    // 准备证书数据
    const certificateData = {
      callsign: card.callsign,
      name: card.name || '',
      date: card.eyeballInfo.meetingDate || card.contactDate,
      location: card.eyeballInfo.meetingLocation || '',
      eventName: card.eyeballInfo.meetingName || '',
      witnesses: card.eyeballInfo.witnesses || [],
      verificationMethod: card.eyeballInfo.verificationMethod || 'in_person',
      additionalInfo: additionalInfo || '',
      customFields: {}
    };
    
    // 生成证书文件
    const certificateHtml = await generateCertificateHtml(template, certificateData);
    const certificateFilePath = await generateCertificatePdf(certificateHtml, card.callsign);
    
    // 生成缩略图
    const thumbnailPath = await generateCertificateThumbnail(certificateFilePath, card.callsign);
    
    // 保存证书记录
    const certificate = new Certificate({
      userId: req.user.id,
      cardId: card._id,
      type: 'eyeball',
      title: title || `EYEBALL证书 - ${card.callsign}`,
      description: description || `与 ${card.callsign} 的EYEBALL通联证书`,
      templateId: template._id,
      data: certificateData,
      fileUrl: `/uploads/certificates/${path.basename(certificateFilePath)}`,
      thumbnailUrl: `/uploads/certificates/thumbnails/${path.basename(thumbnailPath)}`,
      isPublic: isPublic || false,
      status: 'active'
    });
    
    await certificate.save();
    
    res.status(201).json({
      success: true,
      data: {
        certificate,
        fileUrl: certificate.fileUrl,
        thumbnailUrl: certificate.thumbnailUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取证书模板列表
 * @route   GET /api/certificates/templates
 * @access  Private
 */
exports.getCertificateTemplates = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    // 构建查询条件
    const query = {
      $or: [
        { isSystem: true },
        { userId: req.user.id }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    // 执行查询
    const templates = await CertificateTemplate.find(query);
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取证书详情
 * @route   GET /api/certificates/:id
 * @access  Private
 */
exports.getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!certificate) {
      return next(createError(404, '证书不存在'));
    }
    
    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取证书列表
 * @route   GET /api/certificates
 * @access  Private
 */
exports.getCertificatesList = async (req, res, next) => {
  try {
    const { type, callsign, status, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (callsign) {
      query['data.callsign'] = { $regex: callsign, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 执行查询
    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await Certificate.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: certificates,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除证书
 * @route   DELETE /api/certificates/:id
 * @access  Private
 */
exports.deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!certificate) {
      return next(createError(404, '证书不存在'));
    }
    
    // 删除证书文件
    const certificateFilePath = path.join(__dirname, '../../', certificate.fileUrl);
    if (fs.existsSync(certificateFilePath)) {
      fs.unlinkSync(certificateFilePath);
    }
    
    // 删除缩略图
    if (certificate.thumbnailUrl) {
      const thumbnailPath = path.join(__dirname, '../../', certificate.thumbnailUrl);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // 删除证书记录
    await certificate.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {
        message: '证书已删除'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 生成证书HTML
 * @param {Object} template - 证书模板
 * @param {Object} data - 证书数据
 * @returns {Promise<string>} - 生成的HTML
 */
const generateCertificateHtml = async (template, data) => {
  try {
    // 注册Handlebars助手函数
    handlebars.registerHelper('formatDate', function(date, format) {
      return moment(date).format(format || 'YYYY-MM-DD');
    });
    
    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
    
    handlebars.registerHelper('ifNotEmpty', function(value, options) {
      if (value && (typeof value === 'string' ? value.trim() !== '' : true)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    
    // 编译模板
    const compiledTemplate = handlebars.compile(template.templateHtml);
    
    // 渲染HTML
    const html = compiledTemplate({
      ...data,
      css: template.templateCss
    });
    
    return html;
  } catch (error) {
    throw error;
  }
};

/**
 * 生成证书PDF
 * @param {string} html - 证书HTML
 * @param {string} callsign - 呼号
 * @returns {Promise<string>} - 生成的PDF文件路径
 */
const generateCertificatePdf = async (html, callsign) => {
  try {
    // 确保目录存在
    const certificatesDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const fileName = `eyeball_certificate_${callsign.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    // 启动Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置HTML内容
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // 生成PDF
    await page.pdf({
      path: filePath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    // 关闭浏览器
    await browser.close();
    
    return filePath;
  } catch (error) {
    throw error;
  }
};

/**
 * 生成证书缩略图
 * @param {string} pdfPath - PDF文件路径
 * @param {string} callsign - 呼号
 * @returns {Promise<string>} - 生成的缩略图文件路径
 */
const generateCertificateThumbnail = async (pdfPath, callsign) => {
  try {
    // 确保目录存在
    const thumbnailsDir = path.join(__dirname, '../../uploads/certificates/thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const fileName = `eyeball_certificate_${callsign.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_thumb.png`;
    const filePath = path.join(thumbnailsDir, fileName);
    
    // 启动Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 打开PDF文件
    await page.goto(`file://${pdfPath}`, { waitUntil: 'networkidle0' });
    
    // 生成缩略图
    await page.screenshot({
      path: filePath,
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 800,
        height: 600
      }
    });
    
    // 关闭浏览器
    await browser.close();
    
    return filePath;
  } catch (error) {
    throw error;
  }
};

/**
 * 创建默认证书模板
 * @returns {Promise<void>}
 */
exports.createDefaultTemplates = async () => {
  try {
    // 检查是否已存在默认EYEBALL证书模板
    const existingTemplate = await CertificateTemplate.findOne({
      type: 'eyeball',
      isDefault: true,
      isSystem: true
    });
    
    if (existingTemplate) {
      return;
    }
    
    // 创建默认EYEBALL证书模板
    const defaultEyeballTemplate = new CertificateTemplate({
      name: '默认EYEBALL证书模板',
      description: '系统默认的EYEBALL证书模板',
      type: 'eyeball',
      templateHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>EYEBALL证书</title>
          <style>
            {{css}}
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .certificate {
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
              background-color: #fff;
              border: 20px solid #1a5276;
              padding: 40px;
              box-sizing: border-box;
              position: relative;
              color: #333;
            }
            .certificate-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .certificate-title {
              font-size: 36px;
              font-weight: bold;
              color: #1a5276;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .certificate-subtitle {
              font-size: 24px;
              color: #2874a6;
              margin-bottom: 20px;
            }
            .certificate-content {
              font-size: 18px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .certificate-callsign {
              font-size: 32px;
              font-weight: bold;
              color: #1a5276;
              text-align: center;
              margin: 20px 0;
            }
            .certificate-details {
              margin: 30px 0;
            }
            .certificate-detail-row {
              display: flex;
              margin-bottom: 10px;
            }
            .certificate-detail-label {
              font-weight: bold;
              width: 150px;
            }
            .certificate-footer {
              margin-top: 50px;
              text-align: center;
            }
            .certificate-signature {
              margin-top: 80px;
              display: flex;
              justify-content: space-between;
            }
            .signature-block {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-bottom: 5px;
            }
            .certificate-seal {
              position: absolute;
              bottom: 30px;
              right: 30px;
              width: 120px;
              height: 120px;
              border: 2px solid #1a5276;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #1a5276;
              transform: rotate(-15deg);
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="certificate-header">
              <div class="certificate-title">EYEBALL通联证书</div>
              <div class="certificate-subtitle">业余无线电目视通联确认</div>
            </div>
            
            <div class="certificate-content">
              兹证明，业余无线电爱好者 <strong>{{name}}</strong>（呼号：<strong>{{callsign}}</strong>）
              于 <strong>{{formatDate date "YYYY年MM月DD日"}}</strong> 
              {{#ifNotEmpty eventName}}
              在 <strong>{{eventName}}</strong> 活动中
              {{/ifNotEmpty}}
              {{#ifNotEmpty location}}
              于 <strong>{{location}}</strong>
              {{/ifNotEmpty}}
              通过目视方式进行了业余无线电通联。
            </div>
            
            <div class="certificate-callsign">{{callsign}}</div>
            
            <div class="certificate-details">
              {{#ifNotEmpty verificationMethod}}
              <div class="certificate-detail-row">
                <div class="certificate-detail-label">验证方式：</div>
                <div>
                  {{#ifEquals verificationMethod "in_person"}}面对面{{/ifEquals}}
                  {{#ifEquals verificationMethod "photo"}}照片{{/ifEquals}}
                  {{#ifEquals verificationMethod "video"}}视频{{/ifEquals}}
                  {{#ifEquals verificationMethod "third_party"}}第三方证明{{/ifEquals}}
                  {{#ifEquals verificationMethod "other"}}其他{{/ifEquals}}
                </div>
              </div>
              {{/ifNotEmpty}}
              
              {{#if witnesses.length}}
              <div class="certificate-detail-row">
                <div class="certificate-detail-label">证人：</div>
                <div>
                  {{#each witnesses}}
                    {{this.name}} ({{this.callsign}}){{#unless @last}}, {{/unless}}
                  {{/each}}
                </div>
              </div>
              {{/if}}
              
              {{#ifNotEmpty additionalInfo}}
              <div class="certificate-detail-row">
                <div class="certificate-detail-label">附加信息：</div>
                <div>{{additionalInfo}}</div>
              </div>
              {{/ifNotEmpty}}
            </div>
            
            <div class="certificate-signature">
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>发证人签名</div>
              </div>
              
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>接收人签名</div>
              </div>
            </div>
            
            <div class="certificate-footer">
              <p>本证书由业余无线电卡片管理系统自动生成</p>
              <p>证书生成日期：{{formatDate (lookup this 'now') "YYYY年MM月DD日"}}</p>
            </div>
            
            <div class="certificate-seal">
              <div>EYEBALL<br>通联证书</div>
            </div>
          </div>
        </body>
        </html>
      `,
      templateCss: '',
      isDefault: true,
      isSystem: true,
      paperSize: 'A4',
      orientation: 'landscape',
      supportedFields: [
        {
          name: 'callsign',
          label: '呼号',
          type: 'text',
          isRequired: true
        },
        {
          name: 'name',
          label: '姓名',
          type: 'text',
          isRequired: false
        },
        {
          name: 'date',
          label: '通联日期',
          type: 'date',
          isRequired: true
        },
        {
          name: 'location',
          label: '地点',
          type: 'text',
          isRequired: false
        },
        {
          name: 'eventName',
          label: '活动名称',
          type: 'text',
          isRequired: false
        },
        {
          name: 'witnesses',
          label: '证人',
          type: 'list',
          isRequired: false
        },
        {
          name: 'verificationMethod',
          label: '验证方式',
          type: 'text',
          isRequired: false
        },
        {
          name: 'additionalInfo',
          label: '附加信息',
          type: 'text',
          isRequired: false
        }
      ]
    });
    
    await defaultEyeballTemplate.save();
    
    console.log('默认EYEBALL证书模板创建成功');
  } catch (error) {
    console.error('创建默认证书模板失败:', error);
  }
};

