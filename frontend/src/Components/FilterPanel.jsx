import { Input, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function FilterPanel({ filters, setFilters, onSearch, sidebarOpen = false }) {

    const containerStyle = {
        display: 'grid',
        gap: sidebarOpen ? 16 : 12,
        marginBottom: 16,
        width: '100%',
        padding: 5
    };

    const fieldStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,   // QUAN TRỌNG để không bị tràn grid
        width: '100%'
    };

    const labelStyle = {
        fontSize: 13,
        fontWeight: 500,
        color: '#374151',
        whiteSpace: 'nowrap'
    };

    const specialLabelStyle = {
        ...labelStyle,
        marginRight: sidebarOpen ? 8 : 0
    };

    const inputStyle = {
        flex: 1,
        minWidth: 0,
        width: '100%'
    };

    const cityDistrictOptions = {
        hn: [
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
        ],
        dn: [
            { label: 'Hải Châu', value: 'hai-chau' },
            { label: 'Thanh Khê', value: 'thanh-khe' },
            { label: 'Sơn Trà', value: 'son-tra' },
            { label: 'Ngũ Hành Sơn', value: 'ngu-hanh-son' },
            { label: 'Cẩm Lệ', value: 'cam-le' },
            { label: 'Liên Chiểu', value: 'lien-chieu' },
            { label: 'Hoà Vang', value: 'hoa-vang' },
            { label: 'Hoàng Sa', value: 'hoang-sa' },
        ],
        hcm: [
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
        ],
    };

    const mobileCss = `

/* Desktop & sidebar open/close: 6 columns */
.filter-container{
    grid-template-columns: repeat(6, minmax(120px, 1fr));
}

/* Khi chiều rộng giảm: các ô co lại để tránh chồng */
@media (max-width:1200px){
    .filter-container{
        grid-template-columns: repeat(6, minmax(100px, 1fr));
        gap: 10px;
    }
}

/* Tablet */
@media (max-width:768px){
    .filter-container{
        grid-template-columns: repeat(3, minmax(100px, 1fr));
        gap: 10px;
    }

    .filter-field{
        flex-direction:column;
        align-items:stretch;
    }
        .filter-field label{
        display:none;
    }
}

/* Mobile: 6 hàng, ẩn label */
@media (max-width:480px){
    .filter-container{
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .filter-field{
        flex-direction:column;
        align-items:stretch;
    }

    .filter-field label{
        display:none;
    }
}
`;

    return (
        <>
            <style>{mobileCss}</style>

            <div style={{ borderBottom: '1px solid #E5E7EB', marginRight: 10 }}>

                <div style={containerStyle} className="filter-container">

                    <div style={fieldStyle} className="filter-field">
                        <label style={labelStyle}>Loại TK:</label>
                        <Select
                            placeholder="Loại tài khoản"
                            value={filters.accountType}
                            allowClear
                            style={inputStyle}
                            options={[
                                { label: 'Admin', value: 'admin' },
                                { label: 'Học sinh', value: 'student' },
                                { label: 'Giáo viên', value: 'teacher' },
                                { label: 'Phụ huynh', value: 'parent' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, accountType: val })}
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={labelStyle}>Cấp:</label>
                        <Select
                            placeholder="Cấp"
                            value={filters.level}
                            allowClear
                            style={inputStyle}
                            options={[
                                { label: 'Cấp 1', value: 'cap1' },
                                { label: 'Cấp 2', value: 'cap2' },
                                { label: 'Cấp 3', value: 'cap3' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, level: val })}
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={labelStyle}>Tỉnh / Thành:</label>
                        <Select
                            placeholder="Tỉnh/Thành"
                            value={filters.city}
                            allowClear
                            style={inputStyle}
                            options={[
                                { label: 'Hà Nội', value: 'hn' },
                                { label: 'Đà Nẵng', value: 'dn' },
                                { label: 'HCM', value: 'hcm' },
                            ]}
                            onChange={(val) => setFilters({ ...filters, city: val, district: undefined })}
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={specialLabelStyle}>Xã / Phường:</label>
                        <Select
                            placeholder="Xã / Phường"
                            allowClear
                            disabled={!filters.city}
                            value={filters.district}
                            style={inputStyle}
                            onChange={(val) => setFilters({ ...filters, district: val })}
                            options={cityDistrictOptions[filters.city] || []}
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={specialLabelStyle}>Phone:</label>
                        <Input
                            placeholder="Điện thoại"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={labelStyle}>Email:</label>
                        <Input
                            placeholder="Email"
                            value={filters.email}
                            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                </div>

                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    block
                    onClick={onSearch}
                    style={{ marginBottom: 16 }}
                >
                    Tìm kiếm
                </Button>

            </div>
        </>
    );
}