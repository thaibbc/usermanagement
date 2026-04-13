import { Modal } from 'antd';

export default function DeleteModal({ open, userName, onOk, onCancel }) {
    return (
        <Modal
            title="Xác nhận xóa"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
        >
            <p>
                Bạn có chắc chắn muốn xóa người dùng <strong>{userName}</strong>?
                <br />
                Hành động này không thể hoàn tác.
            </p>
        </Modal>
    );
}