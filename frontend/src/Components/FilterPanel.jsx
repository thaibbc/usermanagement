import { Input, Button } from 'antd';
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
                        <Input
                            placeholder="Loại tài khoản"
                            value={filters.accountType}
                            onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
                            style={inputStyle}
                            size="medium"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '30px' }}>Cấp:</label>
                        <Input
                            placeholder="Cấp"
                            value={filters.level}
                            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                            style={inputStyle}
                            size="medium"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '70px' }}>Tỉnh/Thành phố:</label>
                        <Input
                            placeholder="Tỉnh/Thành phố"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            style={inputStyle}
                            size="medium"
                        />
                    </div>

                    <div style={fieldStyle} className="filter-field">
                        <label style={{ ...labelStyle, minWidth: '80px' }}>Xã/Phường:</label>
                        <Input
                            placeholder="Xã/Phường"
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            style={inputStyle}
                            size="medium"
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
