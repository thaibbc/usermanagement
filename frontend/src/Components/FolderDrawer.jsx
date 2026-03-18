// Components/FolderDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Space,
    Tooltip,
    message,
    InputNumber,
    Row,
    Col,
    Grid
} from 'antd';
import { FolderOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const COLORS = [
    '#2E3A59', '#000000', '#F44336', '#E91E63', '#9C27B0',
    '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
    '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B',
];

export const FolderDrawer = ({
    visible,
    onClose,
    onSubmit,
    initialValues = null,
    parentOptions = []
}) => {
    const [form] = Form.useForm();
    const [selectedColor, setSelectedColor] = useState(initialValues?.color || '#2E3A59');
    const [loading, setLoading] = useState(false);
    const screens = useBreakpoint();

    const isEditMode = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setSelectedColor(initialValues.color || '#2E3A59');
            } else {
                form.resetFields();
                setSelectedColor('#2E3A59');
            }
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            if (values.order && values.order <= 0) {
                message.error('Thứ tự phải lớn hơn 0');
                setLoading(false);
                return;
            }

            await onSubmit({
                ...values,
                color: selectedColor,
                id: initialValues?.id
            });

            form.resetFields();
            setSelectedColor('#2E3A59');
            setLoading(false);
            // Không gọi onClose ở đây vì onSubmit đã xử lý

        } catch (error) {
            console.error('Validation failed:', error);
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedColor('#2E3A59');
        onClose();
    };

    const getParentOptions = () => {
        if (parentOptions.length > 0) return parentOptions;
        return [
            { value: 'khoi-9', label: 'Khối 9' },
            { value: 'khoi-8', label: 'Khối 8' },
            { value: 'khoi-7', label: 'Khối 7' },
            { value: 'khoi-6', label: 'Khối 6' },
        ];
    };

    // Responsive width
    const getModalWidth = () => {
        if (!screens.md) return '90%'; // Mobile
        if (!screens.lg) return 520; // Tablet
        return 440; // Desktop
    };

    return (
        <Modal
            title={
                <div style={{
                    fontSize: screens.xs ? '14px' : '15px',
                    fontWeight: 600,
                    color: '#00BCD4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FolderOutlined />
                    <span>{isEditMode ? 'CẬP NHẬT THƯ MỤC' : 'TẠO THƯ MỤC MỚI'}</span>
                </div>
            }
            width={getModalWidth()}
            onCancel={handleClose}
            open={visible}
            footer={
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    padding: screens.xs ? '8px 0 0 0' : '12px 0 4px 0'
                }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        size={screens.xs ? 'middle' : 'default'}
                    >
                        Đóng
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        style={{ background: '#00BCD4' }}
                        size={screens.xs ? 'middle' : 'default'}
                    >
                        {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            }
            styles={{
                body: {
                    padding: screens.xs ? '16px' : '20px',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                },
                header: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: screens.xs ? '12px 16px' : '14px 20px'
                },
                footer: {
                    borderTop: '1px solid #f0f0f0',
                    padding: screens.xs ? '0 16px' : '0 20px'
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                size={screens.xs ? 'middle' : 'middle'}
                initialValues={initialValues || {
                    parent: parentOptions[0]?.value || 'khoi-9',
                    order: 1
                }}
            >
                {/* Cấp cha */}
                <Form.Item
                    label={
                        <Space size={2}>
                            <span style={{ fontSize: screens.xs ? '12px' : '13px', fontWeight: 500 }}>
                                Cấp cha
                            </span>
                            <Tooltip title="Chọn thư mục cha cho thư mục này">
                                <QuestionCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                            </Tooltip>
                        </Space>
                    }
                    name="parent"
                >
                    <Select
                        placeholder="Chọn cấp cha"
                        dropdownStyle={{ maxHeight: 300 }}
                        showSearch
                        optionFilterProp="children"
                        size={screens.xs ? 'middle' : 'default'}
                    >
                        {getParentOptions().map(option => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Tên thư mục */}
                <Form.Item
                    label={
                        <Space size={2}>
                            <span style={{ fontSize: screens.xs ? '12px' : '13px', fontWeight: 500 }}>
                                <span style={{ color: '#ff4d4f' }}>* </span>
                                Tên thư mục
                            </span>
                        </Space>
                    }
                    name="name"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên thư mục' },
                        { min: 2, message: 'Tên thư mục phải có ít nhất 2 ký tự' },
                        { max: 100, message: 'Tên thư mục không được vượt quá 100 ký tự' }
                    ]}
                >
                    <Input
                        placeholder="Nhập tên thư mục"
                        maxLength={100}
                        size={screens.xs ? 'middle' : 'default'}
                    />
                </Form.Item>

                {/* Thứ tự */}
                <Form.Item
                    label={
                        <Space size={2}>
                            <span style={{ fontSize: screens.xs ? '12px' : '13px', fontWeight: 500 }}>
                                <span style={{ color: '#ff4d4f' }}>* </span>
                                Thứ tự
                            </span>
                            <Tooltip title="Số thứ tự hiển thị (số nhỏ hiển thị trước)">
                                <QuestionCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                            </Tooltip>
                        </Space>
                    }
                    name="order"
                    rules={[
                        { required: true, message: 'Vui lòng nhập thứ tự' },
                        { type: 'number', min: 1, message: 'Thứ tự phải lớn hơn 0' }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập thứ tự"
                        style={{ width: '100%' }}
                        min={1}
                        max={999}
                        size={screens.xs ? 'middle' : 'default'}
                    />
                </Form.Item>

                {/* Màu sắc */}
                <Form.Item
                    label={
                        <Space size={2}>
                            <span style={{ fontSize: screens.xs ? '12px' : '13px', fontWeight: 500 }}>
                                Màu sắc
                            </span>
                            <Tooltip title="Chọn màu sắc cho thư mục">
                                <QuestionCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                            </Tooltip>
                        </Space>
                    }
                >
                    <div>
                        {/* Colors grid - responsive */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: screens.xs ? 'repeat(8, 1fr)' : 'repeat(10, 1fr)',
                            gap: screens.xs ? '4px' : '6px',
                            marginBottom: '10px'
                        }}>
                            {COLORS.map((color) => (
                                <Tooltip key={color} title={color}>
                                    <div
                                        onClick={() => setSelectedColor(color)}
                                        style={{
                                            width: screens.xs ? '24px' : '28px',
                                            height: screens.xs ? '24px' : '28px',
                                            borderRadius: '6px',
                                            backgroundColor: color,
                                            cursor: 'pointer',
                                            border: selectedColor === color ? '3px solid #1890ff' : '1px solid #d9d9d9',
                                            boxShadow: selectedColor === color ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
                                            transition: 'all 0.2s ease',
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </div>

                        {/* Màu đã chọn */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            background: '#f5f5f5',
                            borderRadius: '4px'
                        }}>
                            <span style={{ fontSize: screens.xs ? '12px' : '13px', fontWeight: 500 }}>
                                Màu đã chọn:
                            </span>
                            <div style={{
                                width: screens.xs ? '18px' : '20px',
                                height: screens.xs ? '18px' : '20px',
                                borderRadius: '4px',
                                backgroundColor: selectedColor,
                                border: '1px solid #d9d9d9'
                            }} />
                            <span style={{ fontSize: screens.xs ? '11px' : '12px', color: '#666' }}>
                                {selectedColor}
                            </span>
                        </div>
                    </div>
                </Form.Item>

                {/* Thông tin thêm khi edit */}
                {isEditMode && initialValues && (
                    <div style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: '#f0f9ff',
                        borderRadius: '6px',
                        border: '1px solid #bae7ff'
                    }}>
                        <div style={{
                            fontSize: screens.xs ? '12px' : '13px',
                            fontWeight: 600,
                            color: '#00BCD4',
                            marginBottom: '6px'
                        }}>
                            Thông tin thư mục
                        </div>
                        <Row gutter={[8, 4]}>
                            <Col span={12}>
                                <span style={{ color: '#666' }}>Ngày tạo:</span>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right', fontWeight: 500 }}>
                                <span>{initialValues.createdAt || '---'}</span>
                            </Col>
                            <Col span={12}>
                                <span style={{ color: '#666' }}>Cập nhật:</span>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right', fontWeight: 500 }}>
                                <span>{initialValues.updatedAt || '---'}</span>
                            </Col>
                        </Row>
                    </div>
                )}
            </Form>
        </Modal>
    );
};