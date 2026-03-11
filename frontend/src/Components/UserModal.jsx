import { Modal, Input, Select } from 'antd';

// reusable modal used for both add & edit
export default function UserModal({
    visible,
    title,
    user,
    setUser,
    onOk,
    onCancel,
    okDisabled,
}) {
    const updateField = (field, value) => {
        setUser({ ...user, [field]: value });
    };

    return (
        <Modal
            title={title}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okButtonProps={{ disabled: okDisabled }}
            cancelText="Hủy"
            okText={title.includes('Thêm') ? 'Thêm' : 'Lưu'}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontWeight: 'bold'  }}>
                <Input
                    placeholder="Họ và tên"
                    value={user.name || ''}
                    onChange={e => updateField('name', e.target.value)}
                />
                <Input
                    placeholder="Email"
                    value={user.email || ''}
                    onChange={e => updateField('email', e.target.value)}
                />
                <Input
                    placeholder="Điện thoại"
                    value={user.phone || ''}
                    onChange={e => updateField('phone', e.target.value)}
                />
                <Select
                    placeholder="Loại tài khoản"
                    value={user.accountType || undefined}
                    onChange={v => updateField('accountType', v)}
                    options={[
                        { value: 'student', label: 'Học sinh' },
                        { value: 'teacher', label: 'Giáo viên' },
                    ]}
                />
                <Select
                    placeholder="Cấp"
                    value={user.level || undefined}
                    onChange={v => updateField('level', v)}
                    options={[
                        { value: 'cap1', label: 'Cấp 1' },
                        { value: 'cap2', label: 'Cấp 2' },
                        { value: 'cap3', label: 'Cấp 3' },
                    ]}
                />
                <Input
                    placeholder="Tỉnh / Thành phố"
                    value={user.city || ''}
                    onChange={e => updateField('city', e.target.value)}
                />
                <Input
                    placeholder="Quận / Huyện"
                    value={user.district || ''}
                    onChange={e => updateField('district', e.target.value)}
                />
                <Input
                    placeholder="Trường học"
                    value={user.school || ''}
                    onChange={e => updateField('school', e.target.value)}
                />
            </div>
        </Modal>
    );
}
