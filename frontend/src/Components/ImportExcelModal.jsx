import React, { useState } from 'react';
import {
    Modal,
    Button,
    Radio,
    Upload,
    Table,
    Tag,
    Typography,
    message,
    Progress,
    Spin,
} from 'antd';
import {
    UploadOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import QuestionPreviewModal from './QuestionPreviewModal';
import { createQuestion, fetchQuestions } from '../api/questions';

const { Text, Link } = Typography;

// Map tên sheet → loại câu hỏi (dựa trên cấu trúc thực tế của file Excel)
const SHEET_CONFIG = {
    'Multiple Choice': { loaiCauHoi: 'multiple' },
    'Order': { loaiCauHoi: 'order' },
    'Gap - filling': { loaiCauHoi: 'cloze' },
    'Tick Cross': { loaiCauHoi: 'truefalse' },
};

// Sheet tham chiếu, không chứa câu hỏi
const SKIP_SHEETS = ['Danh mục'];

/**
 * Chuyển dữ liệu thô của một câu hỏi thành object hoàn chỉnh tuỳ loại.
 */
function finalizeQuestion(q, sheetType, index) {
    const { tempOptions, tempAnswers, tempStatements, readingContent, cauHoi, ...rest } = q;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    if (sheetType === 'multiple') {
        const optionsObj = {};
        let answerLabel = '';
        tempOptions.forEach((opt, idx) => {
            const isCorrect = opt.startsWith('*');
            const cleanOpt = isCorrect ? opt.substring(1).trim() : opt.trim();
            if (idx < labels.length) optionsObj[labels[idx]] = cleanOpt;
            if (isCorrect) answerLabel = labels[idx];
        });
        return { ...rest, key: index, loaiCauHoi: 'multiple', cauHoi, answer: answerLabel, options: optionsObj };
    }

    if (sheetType === 'order') {
        return {
            ...rest, key: index, loaiCauHoi: 'order',
            cauHoi: 'Sắp xếp các từ để hoàn thành câu',
            answer: cauHoi, options: {},
        };
    }

    if (sheetType === 'cloze') {
        return {
            ...rest, key: index, loaiCauHoi: 'cloze',
            cauHoi: readingContent || cauHoi,
            answer: tempAnswers.join(' | '), options: {},
        };
    }

    if (sheetType === 'truefalse') {
        return {
            ...rest, key: index, loaiCauHoi: 'truefalse',
            cauHoi, statementImage: q.statementImage || '',
            answer: q.firstAnswer || '',
            statements: tempStatements || [], options: {},
        };
    }

    return { ...rest, key: index, cauHoi, options: {} };
}

/**
 * Đọc toàn bộ workbook và trả về danh sách câu hỏi.
 */
function parseWorkbook(workbook) {
    const questionsList = [];

    workbook.SheetNames.forEach(sheetName => {
        if (SKIP_SHEETS.includes(sheetName)) return;

        const config = SHEET_CONFIG[sheetName];
        if (!config) {
            console.warn(`Sheet "${sheetName}" không có cấu hình, bỏ qua.`);
            return;
        }
        const sheetType = config.loaiCauHoi;
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let currentQuestion = null;

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length === 0) continue;

            const stt = row[1];
            const trimSTT = stt ? String(stt).trim() : '';

            if (trimSTT && !isNaN(trimSTT) && Number(trimSTT) > 0) {
                if (currentQuestion) questionsList.push(finalizeQuestion(currentQuestion, sheetType, questionsList.length));

                const col9 = row[9] ? String(row[9]).trim() : '';
                const col10 = row[10] ? String(row[10]).trim() : '';
                const col6 = row[6] ? String(row[6]).trim() : '';

                currentQuestion = {
                    sheetName, id: row[0] || '', stt: trimSTT,
                    khoiLop: row[2] || '', unit: row[3] || '',
                    yeuCauDeBai: row[4] || '', mucDo: row[5] || '',
                    readingContent: col6, imageLink: row[7] || '', audioLink: row[8] || '',
                    cauHoi: col9, statementImage: col10,
                    firstAnswer: sheetType === 'truefalse' ? (row[11] ? String(row[11]).trim() : '') : '',
                    tempOptions: sheetType === 'multiple' ? (col10 ? [col10] : []) : [],
                    tempAnswers: sheetType === 'cloze' ? (col9 ? [col9] : []) : [],
                    tempStatements: sheetType === 'truefalse' ? [{ statement: col9, image: col10, answer: row[11] ? String(row[11]).trim() : '' }] : [],
                    answer: '', trangThai: 'Thêm mới',
                };
            } else if (currentQuestion) {
                if (sheetType === 'multiple') {
                    const opt = row[10] ? String(row[10]).trim() : '';
                    if (opt) currentQuestion.tempOptions.push(opt);
                } else if (sheetType === 'cloze') {
                    const ans = row[9] ? String(row[9]).trim() : '';
                    if (ans) currentQuestion.tempAnswers.push(ans);
                } else if (sheetType === 'truefalse') {
                    const stmt = row[9] ? String(row[9]).trim() : '';
                    const img = row[10] ? String(row[10]).trim() : '';
                    const ans = row[11] ? String(row[11]).trim() : '';
                    if (stmt || img || ans) currentQuestion.tempStatements.push({ statement: stmt, image: img, answer: ans });
                }
            }
        }
        if (currentQuestion) questionsList.push(finalizeQuestion(currentQuestion, sheetType, questionsList.length));
    });

    return questionsList;
}

/* ─── Main Component ─────────────────────────────────────────── */
const ImportExcelModal = ({ open, onClose, onSave }) => {
    const [importMode, setImportMode] = useState('import');
    const [importedQuestions, setImportedQuestions] = useState([]);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [saving, setSaving] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [foundCount, setFoundCount] = useState(0);
    const [notFoundCount, setNotFoundCount] = useState(0);

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const questionsList = parseWorkbook(workbook);
                console.log('Processed questions from all sheets:', questionsList);
                setImportedQuestions(questionsList);
                message.success(`Đã đọc thành công ${questionsList.length} câu hỏi từ ${workbook.SheetNames.length} sheet.`);
            } catch (error) {
                console.error('Lỗi khi đọc file Excel:', error);
                message.error('Không thể đọc tệp Excel. Vui lòng kiểm tra định dạng.');
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // Ngăn upload tự động
    };

    const handleClose = () => {
        if (saving) return; // Không đóng khi đang lưu
        setImportedQuestions([]);
        setPreviewQuestion(null);
        setSaving(false);
        setSavedCount(0);
        setErrorCount(0);
        setFoundCount(0);
        setNotFoundCount(0);
        onClose();
    };

    // Trích xuất kỹ năng từ Yêu cầu đề bài trước chữ "and"
    const extractKyNang = (text) => {
        if (!text) return '';
        const andIndex = text.toLowerCase().indexOf(' and ');
        if (andIndex === -1) return '';

        const beforeAnd = text.substring(0, andIndex);
        const skills = beforeAnd.split(',').map(s => {
            let trimmed = s.trim();
            if (trimmed.length > 0) {
                trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            }
            return trimmed;
        }).filter(s => s);

        return skills.join(', ');
    };

    // Chuyển đổi dữ liệu từ Excel sang format API
    const mapToApiPayload = (q) => {
        let cauHoiApi = q.cauHoi || q.yeuCauDeBai || 'Câu hỏi';
        let answerApi = q.answer || '';

        if (q.loaiCauHoi === 'truefalse' && q.statements && q.statements.length > 0) {
            const statementsText = q.statements.map(s => s.statement || '').join('\n').trim();
            if (statementsText) {
                cauHoiApi = statementsText;
            }
            answerApi = q.statements.map(s => s.answer || '').join(' ; ');
        }

        const payload = {
            khoiLop: q.khoiLop || '',
            unit: q.unit || '',
            kyNang: extractKyNang(q.yeuCauDeBai),
            yeuCauDeBai: q.yeuCauDeBai || '',
            mucDoNhanThuc: q.mucDo || '',
            loaiCauHoi: q.loaiCauHoi || '',
            cauHoi: cauHoiApi,
            answer: answerApi,
            linkHinhAnh: q.imageLink || '',
            linkAudio: q.audioLink || '',
            noiDungBaiDoc: q.readingContent || '',
            sheetName: q.sheetName || '',
        };

        if (q.options) {
            payload.dapAnA = q.options['A'] || '';
            payload.dapAnB = q.options['B'] || '';
            payload.dapAnC = q.options['C'] || '';
            payload.dapAnD = q.options['D'] || '';
        }

        return payload;
    };

    // Helper function to escape regex special characters
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const handleSave = async () => {
        if (importedQuestions.length === 0) {
            message.warning('Chưa có câu hỏi nào để lưu.');
            return;
        }
        setSaving(true);
        setSavedCount(0);
        setErrorCount(0);

        let okCount = 0;
        let failCount = 0;
        const updatedList = [...importedQuestions];

        for (let i = 0; i < updatedList.length; i++) {
            try {
                await createQuestion(mapToApiPayload(updatedList[i]));
                updatedList[i] = { ...updatedList[i], trangThai: 'Đã lưu' };
                okCount++;
                setSavedCount(okCount);
            } catch (err) {
                console.error(`Lỗi lưu câu hỏi STT=${updatedList[i].stt}:`, err);
                updatedList[i] = { ...updatedList[i], trangThai: 'Lỗi' };
                failCount++;
                setErrorCount(failCount);
            }
            // Cập nhật bảng từng dòng một
            setImportedQuestions([...updatedList]);
        }

        setSaving(false);
        if (failCount === 0) {
            message.success(`Đã lưu thành công ${okCount} câu hỏi!`);
        } else {
            message.warning(`Lưu xong: ${okCount} thành công, ${failCount} lỗi.`);
        }
        // Thông báo cho QuestionBank biết để reload danh sách
        if (okCount > 0 && onSave) onSave();
    };

    const handleMatch = async () => {
        if (importedQuestions.length === 0) {
            message.warning('Chưa có câu hỏi nào để tìm ID.');
            return;
        }
        setSaving(true);
        setFoundCount(0);
        setNotFoundCount(0);

        let okMatches = 0;
        let missingMatches = 0;
        const updatedList = [...importedQuestions];

        for (let i = 0; i < updatedList.length; i++) {
            try {
                const q = updatedList[i];
                // MapToApiPayload to get the exact normalized question content
                const payload = mapToApiPayload(q);
                
                // Escape special regex characters to ensure literal matching in backend
                const escapedSearch = escapeRegExp(payload.cauHoi);

                // Search for existing question by content
                const res = await fetchQuestions({ 
                    search: escapedSearch, 
                    limit: 10 // Increased limit to find the exact match among slightly different versions
                });

                let matchedId = null;
                if (res.questions && res.questions.length > 0) {
                    // Try to find an exact match in the returned results
                    const exactMatch = res.questions.find(dbQ => {
                        // Normalize newlines and whitespace for a robust comparison
                        const normalize = (str) => (str || '').replace(/\r\n/g, '\n').trim().toLowerCase();
                        const sameContent = normalize(dbQ.cauHoi) === normalize(payload.cauHoi);
                        const sameType = dbQ.loaiCauHoi === payload.loaiCauHoi;
                        return sameContent && sameType;
                    });
                    if (exactMatch) matchedId = exactMatch._id || exactMatch.id;
                }

                if (matchedId) {
                    updatedList[i] = { ...updatedList[i], trangThai: matchedId };
                    okMatches++;
                    setFoundCount(okMatches);
                } else {
                    updatedList[i] = { ...updatedList[i], trangThai: 'Không tìm thấy' };
                    missingMatches++;
                    setNotFoundCount(missingMatches);
                }
            } catch (err) {
                console.error(`Lỗi tìm ID câu hỏi STT=${updatedList[i].stt}:`, err);
                updatedList[i] = { ...updatedList[i], trangThai: 'Lỗi' };
                missingMatches++;
                setNotFoundCount(missingMatches);
            }
            // Update table row by row
            setImportedQuestions([...updatedList]);
        }

        setSaving(false);
        message.info(`Hoàn tất tìm ID: ${okMatches} đã tìm thấy, ${missingMatches} chưa có.`);
    };

    // Cấu hình cột với khả năng xuống dòng
    const previewColumns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            width: 60,
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Khối lớp',
            dataIndex: 'khoiLop',
            width: 90,
            fixed: 'left',
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            width: 90,
            fixed: 'left',
        },
        {
            title: 'Yêu cầu đề bài',
            dataIndex: 'yeuCauDeBai',
            width: 250,
            render: (text) => (
                <div style={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    maxHeight: 'none'
                }}>
                    {text || ''}
                </div>
            ),
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'cauHoi',
            width: 350,
            render: (text, record) => (
                <div style={{
                    lineHeight: '1.6',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    maxHeight: 'none'
                }}>
                    <div><strong>Question:</strong> {text || ''}</div>
                    <div style={{ marginTop: 2 }}>
                        <strong>Answer:</strong>{' '}
                        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            {record.answer || 'Chưa có đáp án'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: importMode === 'import' ? 'Trạng thái' : 'ID',
            dataIndex: 'trangThai',
            width: 150,
            align: 'center',
            render: (status, record, index) => {
                if (importMode === 'import') {
                    const colorMap = { 'Thêm mới': 'blue', 'Đã lưu': 'green', 'Lỗi': 'red' };
                    return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
                } else {
                    const isFound = status !== 'Không tìm thấy' && status !== 'Lỗi' && status !== 'Thêm mới' && status !== 'Chưa tìm thấy';
                    const displayId = isFound ? String(index + 1).padStart(4, '0') : 'Không tìm thấy';
                    const color = isFound ? 'green' : 'red';
                    return <Tag color={color}>{displayId}</Tag>;
                }
            },
        },
        {
            title: 'Xem trước',
            key: 'preview',
            width: 90,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewQuestion(record)}
                />
            ),
        },
    ];

    return (
        <>
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#00BCD4' }}>
                            NHẬP CÂU HỎI TỪ EXCEL
                        </span>
                        <Radio.Group
                            value={importMode}
                            onChange={(e) => setImportMode(e.target.value)}
                            buttonStyle="solid"
                            size="small"
                        >
                            <Radio.Button value="import">Nhập câu hỏi</Radio.Button>
                            <Radio.Button value="getid">Lấy ID câu hỏi cho file Excel</Radio.Button>
                        </Radio.Group>
                    </div>
                }
                open={open}
                onCancel={handleClose}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                        {/* Progress bar khi đang lưu */}
                        {saving && importedQuestions.length > 0 ? (
                            <div style={{ flex: 1, marginRight: 16 }}>
                                <Progress
                                    percent={Math.round(((savedCount + errorCount) / importedQuestions.length) * 100)}
                                    status={errorCount > 0 ? 'exception' : 'active'}
                                    size="small"
                                    format={() => `${savedCount + errorCount}/${importedQuestions.length}`}
                                />
                            </div>
                        ) : <div style={{ flex: 1 }} />}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button onClick={handleClose} disabled={saving}>Đóng</Button>
                            {importMode === 'import' ? (
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#00BCD4' }}
                                    onClick={handleSave}
                                    loading={saving}
                                    disabled={importedQuestions.length === 0 || saving}
                                >
                                    {saving ? `Đang lưu... (${savedCount}/${importedQuestions.length})` : 'Lưu'}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#00BCD4' }}
                                    onClick={handleMatch}
                                    loading={saving}
                                    disabled={importedQuestions.length === 0 || saving}
                                >
                                    {saving ? `Đang tìm... (${foundCount + notFoundCount}/${importedQuestions.length})` : 'Lấy ID'}
                                </Button>
                            )}
                        </div>
                    </div>
                }
                width={1400}
                centered
                styles={{ body: { padding: '16px 24px', maxHeight: '70vh', overflow: 'auto' } }}
            >
                <div style={{ padding: '10px 0' }}>
                    {/* Upload section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: 32,
                        background: '#f5f5f5',
                        padding: '24px',
                        borderRadius: '12px'
                    }}>
                        <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx,.xls">
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                size="large"
                                style={{ background: '#00BCD4', height: '48px', padding: '0 40px', fontSize: '18px', borderRadius: '8px' }}
                            >
                                Tải lên
                            </Button>
                        </Upload>
                        <Link
                            href="/PhuongNam_QuestionTemplate_TH.xlsx"
                            target="_blank"
                            style={{ color: '#00BCD4', textDecoration: 'underline', fontSize: '14px' }}
                        >
                            Tải tệp mẫu
                        </Link>
                    </div>

                    {/* Preview table */}
                    {importedQuestions.length > 0 && (
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '24px', marginBottom: 16, fontSize: '15px', padding: '0 8px' }}>
                                {importMode === 'import' ? (
                                    <>
                                        <Text strong>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            Hoàn tất: {savedCount} / {importedQuestions.length}
                                        </Text>
                                        <Text strong>
                                            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                            Lỗi: {errorCount}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text strong>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            Câu hỏi tìm thấy: {foundCount}
                                        </Text>
                                        <Text strong>
                                            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                            Không tìm thấy: {notFoundCount}
                                        </Text>
                                    </>
                                )}
                            </div>
                            <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                                <Table
                                    dataSource={importedQuestions}
                                    columns={previewColumns}
                                    pagination={{ pageSize: 5 }}
                                    size="small"
                                    bordered
                                    scroll={{ x: 'max-content', y: 400 }}
                                />
                            </div>
                        </div>
                    )}


                </div>
            </Modal>

            {/* Preview Detail Modal */}
            <QuestionPreviewModal
                question={previewQuestion}
                onClose={() => setPreviewQuestion(null)}
            />
        </>
    );
};

export default ImportExcelModal;