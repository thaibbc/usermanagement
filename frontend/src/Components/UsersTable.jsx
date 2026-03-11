import { Table, Space, Tag, Tooltip, Button } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    SearchOutlined,
    KeyOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

export default function UsersTable({ users, total = 0, currentPage, setCurrentPage, onEdit, onDelete, onChangePassword, loading = false }) {
    // helper to format ISO date string into dd/mm/yyyy hh:mm
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };


    // maps for converting stored values into user-friendly labels
    const ACCOUNT_TYPE_LABELS = {
        student: 'Học sinh',
        teacher: 'Giáo viên',
        parent: 'Phụ huynh',   // added so table shows localized label instead of raw "parent"
    };
    const LEVEL_LABELS = {
        cap1: 'Cấp 1',
        cap2: 'Cấp 2',
        cap3: 'Cấp 3',
    };

    const CITY_LABELS = {
        hn: 'Hà Nội',
        dn: 'Đà Nẵng',
        hcm: 'Hồ Chí Minh',
    };

    const DISTRICT_LABELS = {
        hn: {
            'ba-dinh': 'Ba Đình',
            'hoan-kiem': 'Hoàn Kiếm',
            'tay-ho': 'Tây Hồ',
            'cau-giay': 'Cầu Giấy',
            'thanh-xuan': 'Thanh Xuân',
            'hoang-mai': 'Hoàng Mai',
            'hai-ba-trung': 'Hai Bà Trưng',
            'dong-da': 'Đống Đa',
            'long-bien': 'Long Biên',
            'nam-tu-liem': 'Nam Từ Liêm',
            'bac-tu-liem': 'Bắc Từ Liêm',
            'thanh-tri': 'Thanh Trì',
            'soc-son': 'Sóc Sơn',
            'dan-phuong': 'Đan Phượng',
            'thanh-oai': 'Thanh Oai',
            'thuong-tin': 'Thường Tín',
            'chuong-my': 'Chương Mỹ',
            'hoai-duc': 'Hoài Đức',
            'phuc-tho': 'Phúc Thọ',
            'dong-anh': 'Đông Anh',
            'me-linh': 'Mê Linh',
        },
        dn: {
            'hai-chau': 'Hải Châu',
            'thanh-khe': 'Thanh Khê',
            'son-tra': 'Sơn Trà',
            'ngu-hanh-son': 'Ngũ Hành Sơn',
            'cam-le': 'Cẩm Lệ',
            'lien-chieu': 'Liên Chiểu',
            'hoa-vang': 'Hoà Vang',
            'hoang-sa': 'Hoàng Sa',
        },
        hcm: {
            'q1': 'Quận 1',
            'q2': 'Quận 2',
            'q3': 'Quận 3',
            'q4': 'Quận 4',
            'q5': 'Quận 5',
            'q6': 'Quận 6',
            'q7': 'Quận 7',
            'q8': 'Quận 8',
            'q9': 'Quận 9',
            'q10': 'Quận 10',
            'q11': 'Quận 11',
            'q12': 'Quận 12',
            'thu-duc': 'Thủ Đức',
            'binh-thanh': 'Bình Thạnh',
            'tan-binh': 'Tân Bình',
            'tan-phu': 'Tân Phú',
            'go-vap': 'Gò Vấp',
            'phu-nhuan': 'Phú Nhuận',
            'binh-tan': 'Bình Tân',
            'binh-chanh': 'Bình Chánh',
            'cu-chi': 'Củ Chi',
            'hoc-mon': 'Hóc Môn',
            'nha-be': 'Nhà Bè',
            'can-gio': 'Cần Giờ',
        }
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 100,
            render: (code) => (
                <Space size={4}>
                    <UserOutlined style={{ fontSize: 13, color: 'rgb(0, 0, 0)' }} />
                    <span style={{ fontSize: 13, fontWeight: 'bold' }}>{code}</span>
                </Space>
            ),
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (name, record) => (
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {name || record.email?.split('@')[0] || '—'}
                </span>
            ),
        },
        {
            title: 'Loại TK',
            dataIndex: 'accountType',
            key: 'accountType',
            width: 100,
            render: (type) => {
                const label = type ? ACCOUNT_TYPE_LABELS[type] || type : '';
                return label ? <Tag color="cyan" style={{ fontSize: 13 }}>{label}</Tag> : null;
            },
        },
        {
            title: 'Cấp',
            dataIndex: 'level',
            key: 'level',
            width: 80,
            render: (level) => {
                const label = level ? LEVEL_LABELS[level] || level : '';
                return label ? <Tag color="cyan" style={{ fontSize: 13 }}>{label}</Tag> : null;
            },
        },
        {
            title: 'Tỉnh/TP',
            dataIndex: 'city',
            key: 'city',
            width: 100,
            render: (city) => {
                const label = CITY_LABELS[city] || city || '';
                return <span style={{ fontSize: 13 }}>{label}</span>;
            },
        },
        {
            title: 'Quận/Huyện',
            dataIndex: 'district',
            key: 'district',
            width: 100,
            render: (district, record) => {
                const city = record.city;
                const label = city && DISTRICT_LABELS[city] && DISTRICT_LABELS[city][district]
                    ? DISTRICT_LABELS[city][district]
                    : district || '';
                return <span style={{ fontSize: 13 }}>{label}</span>;
            },
        },
        {
            title: 'Trường',
            dataIndex: 'school',
            key: 'school',
            width: 100,
            render: (school) => <span style={{ fontSize: 13 }}>{school || ''}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 150,
            render: (email) => (
                <Space size={4}>
                    <MailOutlined style={{ fontSize: 12, color: '#3B82F6' }} />
                    <span style={{ fontSize: 13, color: '#3B82F6' }}>{email}</span>
                </Space>
            ),
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            width: 100,
            render: (phone) => phone ? (
                <Space size={4}>
                    <PhoneOutlined style={{ fontSize: 12 }} />
                    <span style={{ fontSize: 13 }}>{phone}</span>
                </Space>
            ) : null,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (date) => (
                <Space size={4}>
                    <CalendarOutlined style={{ fontSize: 13, color: '#060606' }} />
                    <span style={{ fontSize: 13, color: '#070707' }}>{formatDate(date)}</span>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Edit">
                        <Button type="dashed" shape="circle" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Cấp lại mật khẩu">
                        <Button type="dashed" shape="circle" icon={<KeyOutlined />} style={{ color: '#8B5CF6' }} onClick={() => onChangePassword && onChangePassword(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button type="dashed" shape="circle" icon={<DeleteOutlined />} onClick={() => onDelete(record)} danger />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            bordered
            loading={loading}
            columns={columns}
            dataSource={users}
            rowKey="code"
            pagination={{
                current: currentPage,
                onChange: setCurrentPage,
                pageSize: 10,
                total,
                showSizeChanger: false,
                showTotal: (tot, range) => `${range[0]}-${range[1]} / ${tot}`,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
        />
    );
}