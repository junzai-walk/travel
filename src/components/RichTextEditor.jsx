import React, { useState, useEffect, useRef } from 'react';
import './RichTextEditor.css';
import { validateRichText, sanitizeHTML } from '../utils/htmlSanitizer.js';

const RichTextEditor = ({
  value = '',
  onChange,
  onSave,
  onCancel,
  placeholder = '请输入内容...',
  className = '',
  style = {},
  minHeight = '80px',
  showToolbar = true,
  showSaveButtons = true,
  autoFocus = false,
  disabled = false,
  maxLength = 2000,
  maxTextLength = 1000,
  required = false,
  showValidation = true
}) => {
  // 状态管理
  const [isSelectionBold, setIsSelectionBold] = useState(false);
  const [currentHtml, setCurrentHtml] = useState(value || '');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 引用
  const editorRef = useRef(null);
  
  // 初始化内容
  useEffect(() => {
    if (editorRef.current) {
      const htmlValue = value || '';
      // 初始化时或者value发生变化时更新内容
      if (!isInitialized || editorRef.current.innerHTML !== htmlValue) {
        editorRef.current.innerHTML = htmlValue;
        setCurrentHtml(htmlValue);
        setIsInitialized(true);
      }
    }
  }, [value, isInitialized]);

  // 组件挂载时重置初始化状态
  useEffect(() => {
    setIsInitialized(false);
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && editorRef.current && isInitialized) {
      // 延迟聚焦，确保内容已经设置
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          // 将光标移到内容末尾
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 50);
    }
  }, [autoFocus, isInitialized]);

  // 检查选中文本是否为粗体
  const checkIfSelectionIsBold = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    // 如果是文本节点，获取其父节点
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    // 检查节点及其祖先节点是否包含粗体样式
    while (node && node !== editorRef.current) {
      if (node.tagName === 'B' || node.tagName === 'STRONG' || 
          (node.style && node.style.fontWeight === 'bold') ||
          window.getComputedStyle(node).fontWeight === 'bold' ||
          window.getComputedStyle(node).fontWeight === '700') {
        return true;
      }
      node = node.parentNode;
    }

    return false;
  };

  // 处理文本选择变化
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      setIsSelectionBold(false);
      return;
    }

    const isBold = checkIfSelectionIsBold();
    setIsSelectionBold(isBold);

    // 更新当前HTML内容
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setCurrentHtml(newHtml);
      if (onChange) {
        onChange(newHtml);
      }
    }
  };

  // 应用文本格式
  const applyTextFormat = (format, value = null) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    switch (format) {
      case 'bold':
        // 使用浏览器原生的execCommand来处理加粗
        document.execCommand('bold', false, null);
        break;

      case 'color':
        // 使用浏览器原生的execCommand来处理颜色
        document.execCommand('foreColor', false, value);
        break;

      default:
        return;
    }

    // 更新HTML内容
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setCurrentHtml(newHtml);
      if (onChange) {
        onChange(newHtml);
      }
    }

    // 更新选择状态
    setTimeout(() => {
      handleTextSelection();
    }, 10);
  };

  // 验证HTML内容
  const validateContent = (html) => {
    if (!showValidation) return { isValid: true, errors: [], cleanedHTML: html };

    return validateRichText(html, {
      maxLength,
      maxTextLength,
      required
    });
  };

  // 处理输入变化
  const handleInput = (e) => {
    const html = e.target.innerHTML;

    // 验证内容
    const validation = validateContent(html);
    setIsValid(validation.isValid);
    setValidationErrors(validation.errors);

    // 在输入过程中不清理HTML，只在保存时清理
    setCurrentHtml(html);

    if (onChange) {
      onChange(html);
    }
  };

  // 处理保存
  const handleSave = () => {
    const validation = validateContent(currentHtml);
    if (validation.isValid && onSave) {
      onSave(validation.cleanedHTML);
    } else {
      setIsValid(false);
      setValidationErrors(validation.errors);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (onCancel) {
        onCancel();
      }
    }
  };

  // 预定义颜色
  const colors = [
    '#000000', // 黑色
    '#ffffff',  // 白色
    '#dc3545', // 红色
    '#fd7e14', // 橙色
    '#ffc107', // 黄色
    '#198754', // 绿色
    '#0dcaf0', // 青色
    '#0d6efd', // 蓝色
    '#6f42c1', // 紫色
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* 富文本编辑器 */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        onSelect={handleTextSelection}
        className="form-control rich-text-input"
        style={{
          minHeight,
          padding: '8px 12px',
          border: '1px solid #ced4da',
          borderRadius: '0.375rem',
          outline: 'none',
          ...style
        }}
      />

      {/* 富文本编辑工具栏 */}
      {showToolbar && !disabled && (
        <div className="format-toolbar mb-2 p-2 bg-light rounded mt-2">
          <div className="d-flex gap-2 align-items-center">
            {/* 加粗按钮 */}
            <button
              type="button"
              className={`btn btn-sm ${isSelectionBold ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => applyTextFormat('bold')}
              title={isSelectionBold ? "取消加粗" : "加粗"}
            >
              <strong>B</strong>
            </button>
            
            {/* 颜色选择器 */}
            <div className="color-picker d-flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className="btn btn-sm color-btn"
                  style={{
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    padding: 0,
                    border: color === '#ffffff' ? '1px solid #ccc' : 'none'
                  }}
                  onClick={() => applyTextFormat('color', color)}
                  title={`设置颜色为 ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 验证错误信息 */}
      {showValidation && !isValid && validationErrors.length > 0 && (
        <div className="alert alert-danger alert-sm mt-2 mb-2">
          <small>
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </small>
        </div>
      )}

      {/* 保存和取消按钮 */}
      {showSaveButtons && !disabled && (
        <div className="d-flex gap-2 mt-2">
          <button
            className={`btn btn-sm ${isValid ? 'btn-success' : 'btn-outline-success'}`}
            onClick={handleSave}
            disabled={!isValid && showValidation}
          >
            ✓ 保存
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onCancel && onCancel()}
          >
            ✕ 取消
          </button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
