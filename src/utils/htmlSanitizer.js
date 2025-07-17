// HTML内容清理和验证工具
// 确保富文本内容的安全性，防止XSS攻击

/**
 * 允许的HTML标签和属性
 */
const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'span', 'p', 'br'];
const ALLOWED_ATTRIBUTES = {
  'span': ['style'],
  'p': ['style'],
  '*': ['color'] // 所有标签都允许color属性
};

/**
 * 允许的CSS样式属性
 */
const ALLOWED_STYLES = ['color', 'font-weight'];

/**
 * 清理HTML内容，移除不安全的标签和属性
 * @param {string} html - 原始HTML内容
 * @returns {string} - 清理后的安全HTML内容
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // 创建一个临时DOM元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // 递归清理所有节点
  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      
      // 检查标签是否被允许
      if (!ALLOWED_TAGS.includes(tagName)) {
        // 如果标签不被允许，返回其文本内容
        return node.textContent;
      }

      // 创建新的安全元素
      const safeElement = document.createElement(tagName);
      
      // 处理属性
      if (ALLOWED_ATTRIBUTES[tagName] || ALLOWED_ATTRIBUTES['*']) {
        const allowedAttrs = [
          ...(ALLOWED_ATTRIBUTES[tagName] || []),
          ...(ALLOWED_ATTRIBUTES['*'] || [])
        ];
        
        for (const attr of node.attributes) {
          if (allowedAttrs.includes(attr.name)) {
            if (attr.name === 'style') {
              // 清理style属性
              const cleanStyle = sanitizeStyle(attr.value);
              if (cleanStyle) {
                safeElement.setAttribute('style', cleanStyle);
              }
            } else {
              safeElement.setAttribute(attr.name, attr.value);
            }
          }
        }
      }

      // 递归处理子节点
      for (const child of node.childNodes) {
        const cleanedChild = cleanNode(child);
        if (typeof cleanedChild === 'string') {
          safeElement.appendChild(document.createTextNode(cleanedChild));
        } else if (cleanedChild) {
          safeElement.appendChild(cleanedChild);
        }
      }

      return safeElement;
    }

    return null;
  };

  // 清理所有子节点
  const cleanedDiv = document.createElement('div');
  for (const child of tempDiv.childNodes) {
    const cleanedChild = cleanNode(child);
    if (typeof cleanedChild === 'string') {
      cleanedDiv.appendChild(document.createTextNode(cleanedChild));
    } else if (cleanedChild) {
      cleanedDiv.appendChild(cleanedChild);
    }
  }

  return cleanedDiv.innerHTML;
};

/**
 * 清理CSS样式字符串
 * @param {string} styleStr - CSS样式字符串
 * @returns {string} - 清理后的CSS样式字符串
 */
const sanitizeStyle = (styleStr) => {
  if (!styleStr) return '';

  const styles = styleStr.split(';').filter(Boolean);
  const cleanStyles = [];

  for (const style of styles) {
    const [property, value] = style.split(':').map(s => s.trim());
    
    if (ALLOWED_STYLES.includes(property) && value) {
      // 验证颜色值
      if (property === 'color') {
        if (isValidColor(value)) {
          cleanStyles.push(`${property}: ${value}`);
        }
      } else if (property === 'font-weight') {
        if (value === 'bold' || value === 'normal' || /^\d+$/.test(value)) {
          cleanStyles.push(`${property}: ${value}`);
        }
      } else {
        cleanStyles.push(`${property}: ${value}`);
      }
    }
  }

  return cleanStyles.join('; ');
};

/**
 * 验证颜色值是否有效
 * @param {string} color - 颜色值
 * @returns {boolean} - 是否为有效颜色
 */
const isValidColor = (color) => {
  // 检查十六进制颜色
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
    return true;
  }
  
  // 检查RGB颜色
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) {
    return true;
  }
  
  // 检查RGBA颜色
  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) {
    return true;
  }
  
  // 检查预定义颜色名称
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
    'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
  ];
  
  return namedColors.includes(color.toLowerCase());
};

/**
 * 验证HTML内容长度
 * @param {string} html - HTML内容
 * @param {number} maxLength - 最大长度
 * @returns {boolean} - 是否符合长度要求
 */
export const validateHTMLLength = (html, maxLength = 2000) => {
  if (!html) return true;
  return html.length <= maxLength;
};

/**
 * 获取HTML内容的纯文本长度
 * @param {string} html - HTML内容
 * @returns {number} - 纯文本长度
 */
export const getTextLength = (html) => {
  if (!html) return 0;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent.length;
};

/**
 * 验证富文本内容
 * @param {string} html - HTML内容
 * @param {Object} options - 验证选项
 * @returns {Object} - 验证结果
 */
export const validateRichText = (html, options = {}) => {
  const {
    maxLength = 2000,
    maxTextLength = 1000,
    required = false
  } = options;

  const result = {
    isValid: true,
    errors: [],
    cleanedHTML: ''
  };

  // 检查是否为必填
  if (required && (!html || html.trim() === '')) {
    result.isValid = false;
    result.errors.push('内容不能为空');
    return result;
  }

  if (!html) {
    result.cleanedHTML = '';
    return result;
  }

  // 清理HTML内容
  try {
    result.cleanedHTML = sanitizeHTML(html);
  } catch (error) {
    result.isValid = false;
    result.errors.push('HTML内容格式错误');
    return result;
  }

  // 检查HTML长度
  if (!validateHTMLLength(result.cleanedHTML, maxLength)) {
    result.isValid = false;
    result.errors.push(`内容长度不能超过${maxLength}字符`);
  }

  // 检查纯文本长度
  const textLength = getTextLength(result.cleanedHTML);
  if (textLength > maxTextLength) {
    result.isValid = false;
    result.errors.push(`文本内容不能超过${maxTextLength}字符`);
  }

  return result;
};

/**
 * 转换纯文本为HTML
 * @param {string} text - 纯文本
 * @returns {string} - HTML内容
 */
export const textToHTML = (text) => {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
};

/**
 * 转换HTML为纯文本
 * @param {string} html - HTML内容
 * @returns {string} - 纯文本
 */
export const htmlToText = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};
