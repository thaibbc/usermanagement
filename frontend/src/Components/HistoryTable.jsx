import { Table } from 'antd';

export default function HistoryTable({ logs, total = 0, currentPage, setCurrentPage, loading = false }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date) => formatDate(date)
        },
        { title: 'Mã', dataIndex: 'userCode', key: 'userCode', width: 80 },
        { title: 'Hành động', dataIndex: 'action', key: 'action', width: 100 },
        { title: 'Chi tiết', dataIndex: 'details', key: 'details', ellipsis: true },
    ];

    return (
        <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="_id"
            pagination={{
                current: currentPage,
                onChange: setCurrentPage,
                pageSize: 10,
                total,
                showSizeChanger: false,
                showTotal: (tot, range) => `${range[0]}-${range[1]} / ${tot}`
            }}
            size="small"
            scroll={{ x: 'max-content' }}
        />
    );
}