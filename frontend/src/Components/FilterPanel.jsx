import { Select, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// reused filter panel used in different pages if needed
export default function FilterPanel({ filters, setFilters, onSearch }) {
    return (
        <div style={{ borderBottom: '1px solid #E5E7EB', marginRight: 30 }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 16,
                    marginBottom: 16,
                    width: '102%',
                    padding: 5
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Loại tài khoản:
                    </label>
                    <Select
                        placeholder="Chọn loại tài khoản"
                        value={filters.accountType}
                        onChange={(value) => setFilters({ ...filters, accountType: value })}
                        style={{ width: '150px' }}
                        size="middle"
                        allowClear
                        options={[
                            { value: 'student', label: 'Học sinh' },
                            { value: 'teacher', label: 'Giáo viên' },
                            { value: 'shipper', label: 'Shipper' }
                        ]}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Cấp:
                    </label>
                    <Select
                        placeholder="Chọn cấp"
                        value={filters.level}
                        onChange={(value) => setFilters({ ...filters, level: value })}
                        style={{ width: '120px' }}
                        size="middle"
                        allowClear
                        options={[
                            { value: 'cap1', label: 'Cấp 1' },
                            { value: 'cap2', label: 'Cấp 2' },
                            { value: 'cap3', label: 'Cấp 3' }
                        ]}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Tỉnh/Thành phố:
                    </label>
                    <Select
                        placeholder="Chọn tỉnh/thành phố"
                        value={filters.city}
                        onChange={(value) => setFilters({ ...filters, city: value })}
                        style={{ width: '120px' }}
                        size="middle"
                        allowClear
                        options={[
                            { value: 'hanoi', label: 'Hà Nội' },
                            { value: 'hcm', label: 'TP. Hồ Chí Minh' },
                            { value: 'danang', label: 'Đà Nẵng' }
                        ]}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Xã/Phường:
                    </label>
                    <Select
                        placeholder="Chọn xã/phường"
                        value={filters.district}
                        onChange={(value) => setFilters({ ...filters, district: value })}
                        style={{ width: '100%' }}
                        size="middle"
                        allowClear
                        options={[
                            { value: 'district1', label: 'Quận 1' },
                            { value: 'district2', label: 'Quận 2' },
                            { value: 'district3', label: 'Quận 3' }
                        ]}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Trường học:
                    </label>
                    <Input
                        placeholder="Nhập trường học"
                        value={filters.school}
                        onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                        size="middle"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Điện thoại:
                    </label>
                    <Input
                        placeholder="Nhập điện thoại"
                        value={filters.phone}
                        onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                        size="middle"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                        }}
                    >
                        Email:
                    </label>
                    <Input
                        placeholder="Nhập email"
                        value={filters.email}
                        onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                        size="middle"
                    />
                </div>
            </div>
            <Button
                type="primary"
                icon={<SearchOutlined />}
                block
                size="middle"
                onClick={onSearch}
                style={{ width: '102%', marginBottom: 16 }}
            >
                Tìm kiếm
            </Button>
        </div>
    );
}
