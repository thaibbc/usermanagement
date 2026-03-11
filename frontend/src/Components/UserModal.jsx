import { Modal, Input, Button } from 'antd';

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontWeight: 'bold' }}>
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
                <Input
                    placeholder="Loại tài khoản"
                    value={user.accountType || ''}
                    onChange={e => updateField('accountType', e.target.value)}
                />
                <Input
                    placeholder="Cấp"
                    value={user.level || ''}
                    onChange={e => updateField('level', e.target.value)}
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
                {/* password field shown only when adding */}
                {title && title.includes('Thêm') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Input.Password
                            placeholder="Mật khẩu"
                            value={user.password || ''}
                            onChange={e => updateField('password', e.target.value)}
                        />
                        <Button
                            onClick={() => {
                                const random = Math.random().toString(36).slice(-8);
                                updateField('password', random);
                            }}
                        >
                            Pass ngẫu nhiên
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
