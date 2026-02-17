import React, { useState, useRef, useCallback, useEffect } from 'react';

// Word count utility — counts Thai and non-Thai words
const countWords = (html) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!text) return 0;
    // Split by whitespace and filter empty
    return text.split(/\s+/).filter(Boolean).length;
};

const countChars = (html) => {
    if (!html) return 0;
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;
};

// Convert HTML to plain text for export
const htmlToText = (html) => {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const ChapterEditor = ({ nodeId, nodeLabel, chapters = [], onUpdateChapters, onClose }) => {
    const [activeChapterIdx, setActiveChapterIdx] = useState(0);
    const [localChapters, setLocalChapters] = useState(
        chapters.length > 0 ? chapters : [{ id: `ch-${Date.now()}`, title: 'ตอนที่ 1', content: '' }]
    );
    const editorRef = useRef(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const activeChapter = localChapters[activeChapterIdx] || localChapters[0];

    // Sync editor content when switching chapters
    useEffect(() => {
        if (editorRef.current && activeChapter) {
            editorRef.current.innerHTML = activeChapter.content || '';
        }
    }, [activeChapterIdx, activeChapter?.id]);

    // Save content from editor to local state
    const saveCurrentContent = useCallback(() => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setLocalChapters(prev => prev.map((ch, idx) =>
                idx === activeChapterIdx ? { ...ch, content } : ch
            ));
        }
    }, [activeChapterIdx]);

    // Rich text commands
    const execCmd = (cmd, value = null) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
        saveCurrentContent();
    };

    // Add new chapter
    const addChapter = () => {
        const newChapter = {
            id: `ch-${Date.now()}`,
            title: `ตอนที่ ${localChapters.length + 1}`,
            content: ''
        };
        saveCurrentContent();
        setLocalChapters(prev => [...prev, newChapter]);
        setActiveChapterIdx(localChapters.length);
    };

    // Delete chapter
    const deleteChapter = (idx) => {
        if (localChapters.length <= 1) return;
        saveCurrentContent();
        setLocalChapters(prev => prev.filter((_, i) => i !== idx));
        if (activeChapterIdx >= idx && activeChapterIdx > 0) {
            setActiveChapterIdx(activeChapterIdx - 1);
        }
    };

    // Rename chapter
    const renameChapter = (idx, newTitle) => {
        setLocalChapters(prev => prev.map((ch, i) =>
            i === idx ? { ...ch, title: newTitle } : ch
        ));
    };

    // Switch chapter
    const switchChapter = (idx) => {
        saveCurrentContent();
        setActiveChapterIdx(idx);
    };

    // Save and close
    const handleSave = () => {
        saveCurrentContent();
        // Need to get latest content from editorRef since saveCurrentContent is async via setState
        const finalChapters = localChapters.map((ch, idx) => {
            if (idx === activeChapterIdx && editorRef.current) {
                return { ...ch, content: editorRef.current.innerHTML };
            }
            return ch;
        });
        onUpdateChapters(nodeId, finalChapters);
        onClose();
    };

    // Export all chapters as text file
    const exportAll = () => {
        saveCurrentContent();
        const chaptersToExport = localChapters.map((ch, idx) => {
            const content = idx === activeChapterIdx && editorRef.current
                ? editorRef.current.innerHTML : ch.content;
            return `=== ${ch.title} ===\n\n${htmlToText(content)}`;
        }).join('\n\n\n');

        const header = `# ${nodeLabel || 'เรื่องราว'}\n\n`;
        const blob = new Blob([header + chaptersToExport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nodeLabel || 'story'}_all_chapters.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    // Export single chapter
    const exportSingle = (idx) => {
        const ch = localChapters[idx];
        const content = idx === activeChapterIdx && editorRef.current
            ? editorRef.current.innerHTML : ch.content;
        const text = `=== ${ch.title} ===\n\n${htmlToText(content)}`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${ch.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Copy single chapter to clipboard
    const copySingle = (idx) => {
        const ch = localChapters[idx];
        const content = idx === activeChapterIdx && editorRef.current
            ? editorRef.current.innerHTML : ch.content;
        const text = `${ch.title}\n\n${htmlToText(content)}`;
        navigator.clipboard.writeText(text);
    };

    // Total stats
    const totalWords = localChapters.reduce((sum, ch, idx) => {
        const content = idx === activeChapterIdx && editorRef.current
            ? editorRef.current.innerHTML : ch.content;
        return sum + countWords(content);
    }, 0);
    const totalChars = localChapters.reduce((sum, ch, idx) => {
        const content = idx === activeChapterIdx && editorRef.current
            ? editorRef.current.innerHTML : ch.content;
        return sum + countChars(content);
    }, 0);

    const activeWords = countWords(activeChapter?.content || '');
    const activeChars = countChars(activeChapter?.content || '');

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#1a1a1a', border: '1px solid #333',
                    borderRadius: '16px', width: '900px', height: '85vh',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#151515', flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✏️</span>
                        <div>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{nodeLabel || 'เหตุการณ์'}</h3>
                            <span style={{ fontSize: '0.65rem', color: '#666' }}>
                                {localChapters.length} ตอน · {totalWords.toLocaleString()} คำ · {totalChars.toLocaleString()} ตัวอักษร
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Export button */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                style={{ background: '#333', color: '#ccc', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >📤 Export</button>
                            {showExportMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                                    background: '#222', border: '1px solid #444', borderRadius: '8px',
                                    padding: '6px', minWidth: '180px', zIndex: 10,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                                }}>
                                    <button
                                        onClick={exportAll}
                                        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ccc', padding: '8px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >📥 Export ทั้งหมด (.txt)</button>
                                    <div style={{ borderTop: '1px solid #333', margin: '4px 0' }} />
                                    {localChapters.map((ch, idx) => (
                                        <div key={ch.id} style={{ display: 'flex', gap: '2px' }}>
                                            <button
                                                onClick={() => exportSingle(idx)}
                                                style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', color: '#aaa', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.7rem' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >📄 {ch.title}</button>
                                            <button
                                                onClick={() => copySingle(idx)}
                                                title="Copy"
                                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', fontSize: '0.7rem' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >📋</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleSave} style={{ background: '#60a5fa', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>💾 บันทึก</button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                    </div>
                </div>

                {/* Body: Chapter List + Editor */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Chapter Sidebar */}
                    <div style={{
                        width: '200px', borderRight: '1px solid #333',
                        background: '#151515', display: 'flex', flexDirection: 'column',
                        flexShrink: 0
                    }}>
                        <div style={{ padding: '10px', borderBottom: '1px solid #2a2a2a' }}>
                            <button
                                onClick={addChapter}
                                style={{ width: '100%', background: '#2a2a2a', color: '#aaa', border: '1px solid #333', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '0.7rem' }}
                            >+ เพิ่มตอน</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {localChapters.map((ch, idx) => {
                                const chWords = countWords(ch.content);
                                return (
                                    <div
                                        key={ch.id}
                                        onClick={() => switchChapter(idx)}
                                        style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            background: idx === activeChapterIdx ? '#2a2a2a' : 'transparent',
                                            borderLeft: idx === activeChapterIdx ? '3px solid #60a5fa' : '3px solid transparent',
                                            borderBottom: '1px solid #1e1e1e',
                                            transition: 'background 0.15s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <input
                                                value={ch.title}
                                                onChange={(e) => renameChapter(idx, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    background: 'transparent', border: 'none', color: idx === activeChapterIdx ? '#fff' : '#999',
                                                    fontSize: '0.78rem', fontWeight: idx === activeChapterIdx ? 'bold' : 'normal',
                                                    outline: 'none', padding: 0, width: '120px'
                                                }}
                                            />
                                            {localChapters.length > 1 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteChapter(idx); }}
                                                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.6rem', padding: '2px' }}
                                                >✕</button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#555', marginTop: '2px' }}>
                                            {chWords.toLocaleString()} คำ · {countChars(ch.content).toLocaleString()} ตัวอักษร
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Toolbar */}
                        <div style={{
                            padding: '8px 16px',
                            borderBottom: '1px solid #2a2a2a',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: '#1e1e1e', flexShrink: 0
                        }}>
                            <button onClick={() => execCmd('bold')} title="Bold (Ctrl+B)" style={toolBtnStyle}><b>B</b></button>
                            <button onClick={() => execCmd('italic')} title="Italic (Ctrl+I)" style={toolBtnStyle}><i>I</i></button>
                            <button onClick={() => execCmd('underline')} title="Underline (Ctrl+U)" style={{ ...toolBtnStyle, textDecoration: 'underline' }}>U</button>
                            <div style={{ width: '1px', height: '16px', background: '#333', margin: '0 4px' }} />
                            <button onClick={() => execCmd('insertOrderedList')} title="Ordered List" style={toolBtnStyle}>1.</button>
                            <button onClick={() => execCmd('insertUnorderedList')} title="Unordered List" style={toolBtnStyle}>•</button>
                            <div style={{ width: '1px', height: '16px', background: '#333', margin: '0 4px' }} />
                            <button onClick={() => execCmd('formatBlock', '<h2>')} title="Heading" style={toolBtnStyle}>H</button>
                            <button onClick={() => execCmd('formatBlock', '<blockquote>')} title="Quote" style={toolBtnStyle}>❝</button>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: '0.6rem', color: '#555' }}>
                                {activeWords.toLocaleString()} คำ · {activeChars.toLocaleString()} ตัวอักษร
                            </span>
                        </div>

                        {/* ContentEditable Editor */}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={saveCurrentContent}
                            style={{
                                flex: 1,
                                padding: '24px 32px',
                                color: '#ddd',
                                fontSize: '1rem',
                                lineHeight: '1.8',
                                outline: 'none',
                                overflowY: 'auto',
                                fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif",
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}
                            data-placeholder="เริ่มเขียนเรื่องราว..."
                        />
                    </div>
                </div>
            </div>

            {/* Editor placeholder CSS */}
            <style>{`
                [contentEditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #444;
                    font-style: italic;
                    pointer-events: none;
                }
                [contentEditable] blockquote {
                    border-left: 3px solid #60a5fa;
                    padding-left: 12px;
                    margin: 8px 0;
                    color: #999;
                    font-style: italic;
                }
                [contentEditable] h2 {
                    color: #fff;
                    font-size: 1.3rem;
                    margin: 16px 0 8px 0;
                    border-bottom: 1px solid #333;
                    padding-bottom: 4px;
                }
                [contentEditable] b, [contentEditable] strong {
                    color: #fff;
                    font-weight: bold;
                }
                [contentEditable] i, [contentEditable] em {
                    font-style: italic;
                    color: #ccc;
                }
                [contentEditable] ul, [contentEditable] ol {
                    padding-left: 20px;
                    margin: 8px 0;
                }
            `}</style>
        </div>
    );
};

const toolBtnStyle = {
    background: '#2a2a2a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#ccc',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    minWidth: '28px',
    textAlign: 'center'
};

export default ChapterEditor;
