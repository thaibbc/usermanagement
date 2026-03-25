// Components/StudentModals.jsx
import React from 'react';
import { Modal, Form, Input, Alert, Spin, Avatar, Typography, Tag, Descriptions, Button } from 'antd';
import { UserAddOutlined, UserOutlined, EditOutlined, FileExcelOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

export const AddStudentModal = ({ visible, onCancel, onSubmit, loading, email, setEmail, name, setName, phone, setPhone, note, setNote }) => {
    return (
        <Modal
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserAddOutlined style={{ color: '#00bcd4' }} /><span>THÊM HỌC SINH MỚI</span></div>}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" onClick={onSubmit} loading={loading} style={{ backgroundColor: '#00bcd4' }}>Thêm</Button>
            ]}
            width={600}
        >
            <Spin spinning={loading}>
                <div style={{ padding: '20px 0' }}>
                    <Alert message="Hướng dẫn" description="Nhập thông tin học sinh. Email là bắt buộc, học sinh sẽ nhận được thông báo và yêu cầu xác nhận tham gia lớp." type="info" showIcon style={{ marginBottom: 24 }} />
                    <Form layout="vertical">
                        <Form.Item label="Email học sinh" required validateStatus={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'error' : ''} help={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Email không hợp lệ' : ''}>
                            <Input placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} size="large" autoFocus />
                        </Form.Item>
                        <Form.Item label="Họ và tên"><Input placeholder="Nhập họ và tên" value={name} onChange={(e) => setName(e.target.value)} /></Form.Item>
                        <Form.Item label="Số điện thoại"><Input placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} /></Form.Item>
                        <Form.Item label="Ghi chú"><TextArea placeholder="Nhập ghi chú" value={note} onChange={(e) => setNote(e.target.value)} rows={3} /></Form.Item>
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};

export const ImportStudentModal = ({ visible, onCancel, onSubmit, loading, importFile, setImportFile, onDownloadTemplate }) => {
    return (
        <Modal
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileExcelOutlined style={{ color: '#00bcd4' }} /><span>NHẬP HỌC SINH TỪ FILE</span></div>}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" onClick={onSubmit} loading={loading} disabled={!importFile} style={{ backgroundColor: '#00bcd4' }}>Import</Button>
            ]}
            width={600}
        >
            <Spin spinning={loading}>
                <div style={{ padding: '20px 0' }}>
                    <Alert message="Yêu cầu file import" description={<ul style={{ marginTop: 8, paddingLeft: 20 }}><li>File định dạng .xlsx, .xls hoặc .csv</li><li>Cột bắt buộc: email</li><li>Cột tùy chọn: name, phone, note</li><li>Dòng đầu tiên là tiêu đề cột</li></ul>} type="info" showIcon style={{ marginBottom: 24 }} />
                    <div style={{ border: '2px dashed #d9d9d9', borderRadius: 8, padding: 40, textAlign: 'center', cursor: 'pointer', backgroundColor: '#fafafa' }} onClick={() => document.getElementById('fileInput').click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) setImportFile(file); }}>
                        <input id="fileInput" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => setImportFile(e.target.files[0])} />
                        <UploadOutlined style={{ fontSize: 48, color: '#00bcd4', marginBottom: 16 }} />
                        <div>{importFile ? <Text strong>{importFile.name}</Text> : <><Text>Kéo thả file vào đây hoặc </Text><Button type="link" style={{ padding: 0 }}>chọn file</Button></>}</div>
                        {importFile && <div style={{ marginTop: 8 }}><Text type="secondary">{(importFile.size / 1024).toFixed(2)} KB</Text></div>}
                    </div>
                    <div style={{ marginTop: 24, textAlign: 'center' }}><Button type="link" icon={<DownloadOutlined />} onClick={onDownloadTemplate}>Tải file mẫu</Button></div>
                </div>
            </Spin>
        </Modal>
    );
};

export const StudentDetailModal = ({ visible, onCancel, student }) => {
    return (
        <Modal
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserOutlined style={{ color: '#00bcd4' }} /><span>THÔNG TIN HỌC SINH</span></div>}
            open={visible}
            onCancel={onCancel}
            footer={[<Button key="close" onClick={onCancel}>Đóng</Button>]}
            width={500}
        >
            {student && (
                <div style={{ padding: '20px 0' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={80} src={student.avatar} icon={<UserOutlined />} />
                        <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>{student.name}</Title>
                        <Tag color={student.status === 'Đã duyệt' ? 'green' : 'orange'}>{student.status}</Tag>
                    </div>
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Mã học sinh">{student.code}</Descriptions.Item>
                        <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{student.phone || 'Chưa cập nhật'}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tham gia">{student.joinDate || student.requestDate}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">{student.note || 'Không có ghi chú'}</Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
};

export const EditStudentModal = ({ visible, onCancel, onSubmit, loading, name, setName, email, setEmail, phone, setPhone, note, setNote }) => {
    return (
        <Modal
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EditOutlined style={{ color: '#00bcd4' }} /><span>CHỈNH SỬA HỌC SINH</span></div>}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" onClick={onSubmit} loading={loading} style={{ backgroundColor: '#00bcd4' }}>Cập nhật</Button>
            ]}
            width={600}
        >
            <Spin spinning={loading}>
                <div style={{ padding: '20px 0' }}>
                    <Form layout="vertical">
                        <Form.Item label="Họ và tên" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Form.Item>
                        <Form.Item label="Email" required><Input value={email} onChange={(e) => setEmail(e.target.value)} disabled /></Form.Item>
                        <Form.Item label="Số điện thoại"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Form.Item>
                        <Form.Item label="Ghi chú"><TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={3} /></Form.Item>
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};