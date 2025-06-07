const express = require('express');
const router = express.Router();
const { 
  generateEyeballCertificate,
  getCertificateTemplates,
  getCertificateById,
  getCertificatesList,
  deleteCertificate
} = require('../controllers/certificate.controller');

// 生成EYEBALL卡证书
router.post('/eyeball/:cardId', generateEyeballCertificate);

// 获取证书模板列表
router.get('/templates', getCertificateTemplates);

// 获取证书详情
router.get('/:id', getCertificateById);

// 获取证书列表
router.get('/', getCertificatesList);

// 删除证书
router.delete('/:id', deleteCertificate);

module.exports = router;

