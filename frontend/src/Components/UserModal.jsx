import React from 'react';
import { Modal, Input, Button, Form, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import useIsMobile from '../hooks/useIsMobile';

// no autocomplete needed any more; plain inputs suffice


// reusable modal used for both add & edit
export default function UserModal({
    visible,
    title,
    user,
    setUser,
    onOk,
    onCancel,
    okDisabled,
    submitting = false, // disables ok button and shows loading
}) {
    const [form] = Form.useForm();
    const isMobile = useIsMobile(1350);

    // keep form values in sync with prop
    React.useEffect(() => {
        if (visible) {
            // normalize dateOfBirth to a valid dayjs object or remove it entirely
            const values = { ...(user || {}) };
            if (values.dateOfBirth) {
                let dob = values.dateOfBirth;
                if (dayjs.isDayjs(dob)) {
                    // use as-is
                } else if (typeof dob === 'string') {
                    dob = dayjs(dob, 'DD/MM/YYYY');
                    if (!dob.isValid()) {
                        dob = dayjs(dob); // try ISO or other formats
                    }
                } else if (dob instanceof Date) {
                    dob = dayjs(dob);
                } else {
                    dob = dayjs(dob);
                }
                if (dob && dob.isValid()) {
                    values.dateOfBirth = dob;
                } else {
                    delete values.dateOfBirth;
                }
            } else {
                delete values.dateOfBirth;
            }
            form.setFieldsValue(values);
        } else {
            form.resetFields();
        }
    }, [user, visible, form]);

    const updateField = (field, value) => {
        // cascade district clearance when city changes
        if (field === 'city') {
            setUser({ ...user, city: value, district: undefined });
        } else {
            setUser({ ...user, [field]: value });
        }
    };

    const handleFinish = (values) => {
        // propagate validated values back to parent state as well
        setUser(values);
        onOk(values);
    };

    return (
        <Modal
            title={title}
            open={visible}
            forceRender
            onOk={() => form.submit()}
            onCancel={onCancel}
            okButtonProps={{ disabled: okDisabled || submitting, loading: submitting }}
            cancelText="Hủy"
            okText={title.includes('Thêm') ? 'Thêm' : 'Lưu'}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(changed, all) => setUser(all)}
                onFinish={handleFinish}
            >
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, }}>
                    <Form.Item
                        name="name"
                        label={null}
                        rules={[
                            { required: true, message: 'Họ và tên không được để trống' },
                            { min: 3, message: 'Họ và tên phải có ít nhất 3 kí tự' },
                            { pattern: /^[^0-9]+$/, message: 'Họ và tên không được chứa số' }
                        ]}
                    >
                        <Input
                            placeholder="Họ và tên"
                            value={user.name || ''}
                            onChange={e => updateField('name', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={null}
                        rules={[
                            { required: true, message: 'Email không được để trống' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            placeholder="Email"
                            value={user.email || ''}
                            onChange={e => updateField('email', e.target.value)}
                            disabled={!title || !title.includes('Thêm')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label={null}
                        rules={[
                            { required: true, message: 'SĐT là bắt buộc' },
                            {
                                pattern: /^\d{9,11}$/,
                                message: 'SĐT phải gồm 9–11 chữ số'
                            }
                        ]}
                    >
                        <Input
                            placeholder="Điện thoại"
                            value={user.phone || ''}
                            onChange={e => updateField('phone', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateOfBirth"
                        label={null}
                        rules={[{ required: false }]}
                    >
                        <DatePicker
                            placeholder="Ngày sinh"
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            onChange={(date, dateString) => updateField('dateOfBirth', dateString)}
                        />
                    </Form.Item>

                    <Form.Item name="accountType" label={null} rules={[{ required: true, message: 'Loại tài khoản là bắt buộc' }]}>
                        <Select
                            placeholder="Loại tài khoản"
                            allowClear
                            optionLabelProp="label"
                            value={user.accountType}
                            options={[{ label: 'Admin', value: 'admin' }, { label: 'Học sinh', value: 'student' },
                            { label: 'Giáo viên', value: 'teacher' },
                            { label: 'Phụ huynh', value: 'parent' },
                            ]}
                            onChange={val => updateField('accountType', val)}
                        />
                    </Form.Item>

                    <Form.Item name="level" label={null} rules={[{ required: true, message: 'Cấp là bắt buộc' }]}>
                        <Select
                            placeholder="Cấp"
                            allowClear
                            value={user.level}
                            options={[
                                { label: 'Cấp 1', value: 'cap1' },
                                { label: 'Cấp 2', value: 'cap2' },
                                { label: 'Cấp 3', value: 'cap3' },
                            ]}
                            onChange={val => updateField('level', val)}
                        />
                    </Form.Item>

                    {/* replaced by select above */}

                    <Form.Item name="city" label={null} rules={[{ required: true, message: 'Tỉnh / Thành phố là bắt buộc' }]}>
                        <Select
                            placeholder="Tỉnh / Thành phố"
                            allowClear
                            value={user.city}
                            options={[
                                { label: 'Hà Nội', value: 'hn' },
                                { label: 'Đà Nẵng', value: 'dn' },
                                { label: 'Hồ Chí Minh', value: 'hcm' },
                            ]}
                            onChange={val => updateField('city', val)}
                        />
                    </Form.Item>

                    <Form.Item name="district" label={null} rules={[{ required: !!user.city, message: 'Quận / Huyện là bắt buộc' }]}>
                        <Select
                            placeholder="Quận / Huyện"
                            allowClear
                            disabled={!user.city}
                            value={user.district}
                            options={
                                user.city === 'hn'
                                    ? [
                                        { label: 'Ba Đình', value: 'ba-dinh' },
                                        { label: 'Hoàn Kiếm', value: 'hoan-kiem' },
                                        { label: 'Tây Hồ', value: 'tay-ho' },
                                        { label: 'Cầu Giấy', value: 'cau-giay' },
                                        { label: 'Thanh Xuân', value: 'thanh-xuan' },
                                        { label: 'Hoàng Mai', value: 'hoang-mai' },
                                        { label: 'Hai Bà Trưng', value: 'hai-ba-trung' },
                                        { label: 'Đống Đa', value: 'dong-da' },
                                        { label: 'Long Biên', value: 'long-bien' },
                                        { label: 'Nam Từ Liêm', value: 'nam-tu-liem' },
                                        { label: 'Bắc Từ Liêm', value: 'bac-tu-liem' },
                                        { label: 'Thanh Trì', value: 'thanh-tri' },
                                        { label: 'Sóc Sơn', value: 'soc-son' },
                                        { label: 'Đan Phượng', value: 'dan-phuong' },
                                        { label: 'Thanh Oai', value: 'thanh-oai' },
                                        { label: 'Thường Tín', value: 'thuong-tin' },
                                        { label: 'Chương Mỹ', value: 'chuong-my' },
                                        { label: 'Hoài Đức', value: 'hoai-duc' },
                                        { label: 'Phúc Thọ', value: 'phuc-tho' },
                                        { label: 'Đông Anh', value: 'dong-anh' },
                                        { label: 'Mê Linh', value: 'me-linh' },
                                    ]
                                    : user.city === 'dn'
                                        ? [
                                            { label: 'Hải Châu', value: 'hai-chau' },
                                            { label: 'Thanh Khê', value: 'thanh-khe' },
                                            { label: 'Sơn Trà', value: 'son-tra' },
                                            { label: 'Ngũ Hành Sơn', value: 'ngu-hanh-son' },
                                            { label: 'Cẩm Lệ', value: 'cam-le' },
                                            { label: 'Liên Chiểu', value: 'lien-chieu' },
                                            { label: 'Hoà Vang', value: 'hoa-vang' },
                                            { label: 'Hoàng Sa', value: 'hoang-sa' },
                                        ]
                                        : user.city === 'hcm'
                                            ? [
                                                { label: 'Quận 1', value: 'q1' },
                                                { label: 'Quận 2', value: 'q2' },
                                                { label: 'Quận 3', value: 'q3' },
                                                { label: 'Quận 4', value: 'q4' },
                                                { label: 'Quận 5', value: 'q5' },
                                                { label: 'Quận 6', value: 'q6' },
                                                { label: 'Quận 7', value: 'q7' },
                                                { label: 'Quận 8', value: 'q8' },
                                                { label: 'Quận 9', value: 'q9' },
                                                { label: 'Quận 10', value: 'q10' },
                                                { label: 'Quận 11', value: 'q11' },
                                                { label: 'Quận 12', value: 'q12' },
                                                { label: 'Thủ Đức', value: 'thu-duc' },
                                                { label: 'Bình Thạnh', value: 'binh-thanh' },
                                                { label: 'Tân Bình', value: 'tan-binh' },
                                                { label: 'Tân Phú', value: 'tan-phu' },
                                                { label: 'Gò Vấp', value: 'go-vap' },
                                                { label: 'Phú Nhuận', value: 'phu-nhuan' },
                                                { label: 'Bình Tân', value: 'binh-tan' },
                                                { label: 'Bình Chánh', value: 'binh-chanh' },
                                                { label: 'Củ Chi', value: 'cu-chi' },
                                                { label: 'Hóc Môn', value: 'hoc-mon' },
                                                { label: 'Nhà Bè', value: 'nha-be' },
                                                { label: 'Cần Giờ', value: 'can-gio' },
                                            ]
                                            : []
                            }
                            onChange={val => updateField('district', val)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="school"
                        label={null}
                        rules={[
                            { required: true, message: 'Trường học là bắt buộc' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const len = value.replace(/\s+/g, '').length;
                                    if (len < 6) {
                                        return Promise.reject('Tên trường không đúng');
                                    }
                                    return /^[^0-9]+$/.test(value)
                                        ? Promise.resolve()
                                        : Promise.reject('Tên trường không được chứa số');
                                }
                            }
                        ]}
                    >
                        <Input
                            placeholder="Trường học"
                            value={user.school || ''}
                            onChange={e => updateField('school', e.target.value)}
                        />
                    </Form.Item>

                    {/* password field shown only when adding */}
                    {title && title.includes('Thêm') && (
                        <Form.Item
                            name="password"
                            label={null}
                            rules={[{ required: true, message: 'Mật khẩu là bắt buộc' }]}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Input.Password
                                    style={{ minWidth: '170px' }}
                                    placeholder="Mật khẩu"
                                    value={user.password || ''}
                                    onChange={e => updateField('password', e.target.value)}
                                />
                                <Button
                                    onClick={() => {
                                        const random = Math.random().toString(36).slice(-8);
                                        updateField('password', random);
                                        form.setFieldsValue({ password: random });
                                    }}
                                >
                                    Pass ngẫu nhiên
                                </Button>
                            </div>
                        </Form.Item>
                    )}
                </div>
            </Form>
        </Modal>
    );
}
