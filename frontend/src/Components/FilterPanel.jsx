import { Input, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// filter panel uses plain inputs now; suggestions removed

// no helper mappings needed since we no longer use AutoComplete


// reused filter panel used in different pages if needed
export default function FilterPanel({ filters, setFilters, onSearch }) {
    // responsive grid: wrap fields into full-width columns on small screens
    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 16,
        width: '100%',
        padding: 5
    };

    const fieldStyle = { display: 'flex', alignItems: 'center', gap: 4 };
    const labelStyle = {
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
        whiteSpace: 'nowrap',
        minWidth: '50px',
        textAlign: 'right'
    };
    const inputStyle = { flex: 1, fontSize: 13, minWidth: '120px', width: '100%' };

    // inject simple mobile CSS to stack labels on top of inputs
    const mobileCss = `
      @media (max-width: 600px) {
        .filter-field { flex-direction: column; align-items: stretch; }
        .filter-field label { text-align: left; margin-bottom: 4px; }
      }
      /* hide labels on very narrow tall screens (e.g. 413x916) */
      @media (max-width: 413px) and (max-height: 916px) {
        .filter-field label { display: none; }
      }
      /* extra-small phones (390x844 and below) hide labels entirely */
      @media (max-width: 390px) and (max-height: 844px) {
        .filter-field label { display: none; }
      }
      /* large portrait devices – remove labels but keep inputs on one row */
      @media (min-width: 1024px) and (min-height: 1366px) {
        .filter-field label { display: none; }
        /* use a cleaner form of grid that automatically spaces inputs evenly */
        .filter-container { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important; }
      }
    `;

    return (
        <>
            <style>{mobileCss}</style>
            <div style={{ borderBottom: '1px solid #E5E7EB' }}>
                <div style={containerStyle} className="filter-container">
                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '50px' }}>Loại tài khoản:</label>
                        <Select
                            placeholder="Loại tài khoản"
                            value={filters.accountType}
                            allowClear
                            optionLabelProp="label"
                            style={{ ...inputStyle, minWidth: '120px' }}
                            options={[{ label: 'Admin', value: 'admin' }, { label: 'Học sinh', value: 'student' },
                            { label: 'Giáo viên', value: 'teacher' },
                            { label: 'Phụ huynh', value: 'parent' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, accountType: val })}
                            size="middle"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '30px' }}>Cấp:</label>
                        <Select
                            placeholder="Cấp"
                            value={filters.level}
                            allowClear
                            style={{ ...inputStyle, minWidth: '120px' }}
                            options={[
                                { label: 'Cấp 1', value: 'cap1' },
                                { label: 'Cấp 2', value: 'cap2' },
                                { label: 'Cấp 3', value: 'cap3' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, level: val })}
                            size="middle"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '70px' }}>Tỉnh/Thành phố:</label>
                        <Select
                            placeholder="Tỉnh/Thành phố"
                            value={filters.city}
                            allowClear
                            style={{ ...inputStyle, minWidth: '120px' }}
                            options={[
                                { label: 'Hà Nội', value: 'hn' },
                                { label: 'Đà Nẵng', value: 'dn' },
                                { label: 'Hồ Chí Minh', value: 'hcm' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, city: val, district: undefined })}
                            size="middle"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '80px' }}>Xã/Phường:</label>
                        <Select
                            placeholder="Xã/Phường"
                            value={filters.district}
                            allowClear
                            disabled={!filters.city}
                            style={{ ...inputStyle, minWidth: '120px' }}
                            options={
                                filters.city === 'hn'
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
                                    : filters.city === 'dn'
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
                                        : filters.city === 'hcm'
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
                            onChange={(val) => setFilters({ ...filters, district: val })}
                            size="middle"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '80px' }}>Điện thoại:</label>
                        <Input
                            placeholder="Nhập điện thoại"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            style={inputStyle}
                            size="medium"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '60px' }}>Email:</label>
                        <Input
                            placeholder="Nhập email"
                            value={filters.email}
                            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                            style={inputStyle}
                            size="medium"
                        />
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    block
                    size="middle"
                    onClick={onSearch}
                    style={{ width: '100%', marginBottom: 16 }}
                >
                    Tìm kiếm
                </Button>
            </div>
        </>
    );
}
