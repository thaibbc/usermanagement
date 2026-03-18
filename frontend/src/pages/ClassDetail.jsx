// pages/ClassDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Layout,
    Card,
    Typography,
    Row,
    Col,
    Tabs,
    Button,
    Drawer,
    Input,
    Select,
    Table,
    DatePicker,
    message,
    Tag,
    InputNumber,
    Tooltip,
    Space,
    Spin
} from 'antd';
import {
    HomeOutlined,
    CopyOutlined,
    MoreOutlined,
    CloseOutlined,
    BookOutlined,
    PlusOutlined,
    FontColorsOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    PictureOutlined,
    LinkOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const { Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

export function ClassDetail({ classData: propClassData, onBack }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { classCode } = useParams();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('baitap');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // SỬA: Dùng chung breakpoint với Sidebar và Header
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [classData, setClassData] = useState(propClassData || location.state?.classData || null);
    const [loading, setLoading] = useState(!propClassData && !location.state?.classData);
    const [fromAdmin, setFromAdmin] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: undefined,
        points: 10,
        color: '#00bcd4',
        requirements: '',
        selectedStudents: [],
        useLibrary: false,
        openTime: null,
        closeTime: null
    });

    // Kiểm tra nguồn gốc và quyền
    useEffect(() => {
        if (location.state?.fromManagement) {
            setFromAdmin(true);
        }
    }, [location.state]);

    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';
    const isStudent = user?.accountType === 'student';

    // Chỉ hiển thị nút tạo bài tập khi là admin/teacher VÀ đến từ trang quản lý
    const canCreateAssignment = (isAdmin || isTeacher) && fromAdmin;

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileOrTablet(window.innerWidth <= 1024);
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch class data if not provided via props or location state
    useEffect(() => {
        if (!classData && classCode) {
            const fetchClassData = async () => {
                try {
                    setLoading(true);
                    // Mock data for demonstration
                    setTimeout(() => {
                        setClassData({
                            key: classCode,
                            code: classCode,
                            name: 'Lớp học ' + classCode,
                            students: 25,
                            note: '',
                            teacher: 'Lê Minh Vương',
                            phone: '0963875102',
                            email: 'vuonglo.dev@gmail.com'
                        });
                        setLoading(false);
                    }, 500);
                } catch (error) {
                    console.error('Error fetching class data:', error);
                    message.error('Không thể tải thông tin lớp học');
                    navigate('/classes');
                }
            };

            fetchClassData();
        }
    }, [classCode, classData, navigate]);

    const handleCopyCode = () => {
        if (classData?.code) {
            navigator.clipboard.writeText(classData.code);
            message.success('Đã sao chép mã lớp');
        }
    };

    const showDrawer = () => {
        if (!canCreateAssignment) {
            message.warning('Bạn không có quyền tạo bài tập');
            return;
        }
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        // Reset form khi đóng
        setFormData({
            title: '',
            type: undefined,
            points: 10,
            color: '#00bcd4',
            requirements: '',
            selectedStudents: [],
            useLibrary: false,
            openTime: null,
            closeTime: null
        });
    };

    const handleSave = async () => {
        // Validate form
        if (!formData.title.trim()) {
            message.error('Vui lòng nhập tiêu đề bài tập');
            return;
        }
        if (!formData.type) {
            message.error('Vui lòng chọn loại bài tập');
            return;
        }
        if (formData.points <= 0) {
            message.error('Điểm phải lớn hơn 0');
            return;
        }

        setSubmitLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Saving:', formData);
            message.success('Đã lưu bài tập thành công');
            closeDrawer();
        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu bài tập');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/classes');
        }
    };

    // Sample student data
    const studentData = [
        {
            key: '1',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com'
        },
        {
            key: '2',
            name: 'Trần Thị B',
            email: 'tranthib@gmail.com'
        },
        {
            key: '3',
            name: 'Lê Văn C',
            email: 'levanc@gmail.com'
        }
    ];

    const studentColumns = [
        {
            title: 'Tên học sinh',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
    ];

    // Color palette
    const colors = [
        '#ffffff', '#000000', '#ff0000', '#e91e63', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
        '#795548', '#607d8b'
    ];

    // Tab items cho từng role
    const getTabItems = () => {
        const baseTabs = [
            {
                key: 'baitap',
                label: 'Bài tập',
                children: (
                    <div>
                        {canCreateAssignment && (
                            <Button
                                type="primary"
                                style={{ marginBottom: 16, backgroundColor: '#00bcd4' }}
                                onClick={showDrawer}
                                icon={<PlusOutlined />}
                                block={isMobileOrTablet}
                            >
                                Tạo bài tập
                            </Button>
                        )}
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                            <BookOutlined style={{ fontSize: 48, marginBottom: 16, color: '#ddd' }} />
                            <div>Chưa có bài tập nào</div>
                            {isStudent && (
                                <div style={{ fontSize: 13, marginTop: 8 }}>
                                    Giáo viên sẽ giao bài tập cho bạn
                                </div>
                            )}
                            {(isAdmin || isTeacher) && !fromAdmin && (
                                <div style={{ fontSize: 13, marginTop: 8 }}>
                                    Vui lòng vào từ trang Quản lý lớp học để tạo bài tập
                                </div>
                            )}
                            {canCreateAssignment && (
                                <div style={{ fontSize: 13, marginTop: 8 }}>
                                    Nhấn nút "Tạo bài tập" để thêm bài tập mới
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                key: 'ketqua',
                label: 'Kết quả rèn luyện',
                children: (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div>Chưa có kết quả nào</div>
                    </div>
                ),
            },
            {
                key: 'hocsinh',
                label: 'Học sinh',
                children: (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div>Chưa có học sinh nào</div>
                    </div>
                ),
            },
            {
                key: 'thongbao',
                label: 'Thông báo',
                children: (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div>Chưa có thông báo nào</div>
                    </div>
                ),
            },
            {
                key: 'renluyen',
                label: 'Rèn luyện, bồi dưỡng',
                children: (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <div>Chưa có bài rèn luyện nào</div>
                    </div>
                ),
            },
        ];

        // Thêm tab Sách điện tử cho học sinh
        if (isStudent) {
            baseTabs.push({
                key: 'sachdientu',
                label: 'Sách điện tử',
                children: (
                    <div style={{ padding: isMobile ? '12px' : '24px' }}>
                        <Row gutter={[16, 16]}>
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={item}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{
                                                height: isMobile ? 120 : 160,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: isMobile ? 36 : 48
                                            }}>
                                                📚
                                            </div>
                                        }
                                        onClick={() => message.info('Đang phát triển')}
                                    >
                                        <Card.Meta
                                            title={`Sách giáo khoa ${item}`}
                                            description="Nhà xuất bản Giáo dục"
                                        />
                                        <div style={{ marginTop: 12 }}>
                                            <Tag color="blue">Lớp {Math.floor(Math.random() * 5) + 6}</Tag>
                                            <Tag color="green">Còn hàng</Tag>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ),
            });
        }

        return baseTabs;
    };

    // Show loading state
    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
                {!isMobileOrTablet && (
                    <Sidebar
                        collapsed={isSidebarCollapsed}
                        setCollapsed={setIsSidebarCollapsed}
                    />
                )}
                <Layout style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: isMobileOrTablet ? 0 : (isSidebarCollapsed ? 80 : 250),
                    transition: 'margin-left 0.3s ease'
                }}>
                    <Header
                        onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        sidebarCollapsed={isSidebarCollapsed}
                    />
                    <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin size="large" tip="Đang tải thông tin lớp học..." />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // Show error if no class data
    if (!classData) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
                {!isMobileOrTablet && (
                    <Sidebar
                        collapsed={isSidebarCollapsed}
                        setCollapsed={setIsSidebarCollapsed}
                    />
                )}
                <Layout style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: isMobileOrTablet ? 0 : (isSidebarCollapsed ? 80 : 250),
                    transition: 'margin-left 0.3s ease'
                }}>
                    <Header
                        onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        sidebarCollapsed={isSidebarCollapsed}
                    />
                    <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div>
                            <Text type="danger">Không tìm thấy thông tin lớp học</Text>
                            <Button type="primary" onClick={() => navigate('/classes')} style={{ marginLeft: 16 }}>
                                Quay lại
                            </Button>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
            {/* Sidebar - chỉ hiển thị trên desktop */}
            {!isMobileOrTablet && (
                <Sidebar
                    collapsed={isSidebarCollapsed}
                    setCollapsed={setIsSidebarCollapsed}
                />
            )}

            <Layout style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginLeft: isMobileOrTablet ? 0 : (isSidebarCollapsed ? 80 : 250),
                transition: 'margin-left 0.3s ease'
            }}>
                <Header
                    onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    sidebarCollapsed={isSidebarCollapsed}
                />

                {/* Breadcrumb */}
                <div style={{
                    backgroundColor: '#00bcd4',
                    padding: isMobile ? '12px 16px' : '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <HomeOutlined style={{ fontSize: isMobile ? '18px' : '20px', color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: isMobile ? '13px' : '14px' }}>
                        {isStudent ? 'Học sinh' : (fromAdmin ? 'Quản lý' : 'Học sinh')} - Lớp học - {classData.name}
                    </Text>
                </div>

                {/* Main Content */}
                <Content style={{ padding: isMobile ? '16px' : '24px' }}>
                    <Card
                        title={
                            <div style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? '12px' : 0
                            }}>
                                <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Thông tin lớp học: {classData.name}
                                </Text>
                                <Button
                                    type="text"
                                    icon={<MoreOutlined />}
                                    onClick={handleBack}
                                    size={isMobile ? 'small' : 'middle'}
                                >
                                    Quay lại
                                </Button>
                            </div>
                        }
                        style={{ backgroundColor: 'white' }}
                        variant="borderless"
                    >
                        {/* Class Info Grid */}
                        <Row gutter={[isMobile ? 16 : 24, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 24 : 32 }}>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Mã lớp học
                                    </Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.code}</Text>
                                        <CopyOutlined
                                            style={{ cursor: 'pointer', color: '#00bcd4', fontSize: isMobile ? '14px' : '16px' }}
                                            onClick={handleCopyCode}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Giáo viên
                                    </Text>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.teacher}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Tên lớp học
                                    </Text>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.name}</Text>
                                </div>
                                <div>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Điện thoại
                                    </Text>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.phone}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Sĩ số
                                    </Text>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.students} học sinh</Text>
                                </div>
                                <div>
                                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                        Email
                                    </Text>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>{classData.email}</Text>
                                </div>
                            </Col>
                        </Row>

                        {/* Tabs */}
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={getTabItems()}
                            size={isMobile ? 'small' : 'middle'}
                            tabBarGutter={isMobile ? 8 : 16}
                            tabBarStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                        />
                    </Card>
                </Content>

                {/* Drawer - Create Assignment */}
                {canCreateAssignment && (
                    <Drawer
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 600, color: '#00bcd4' }}>
                                    TẠO MỚI BÀI TẬP
                                </Text>
                                <CloseOutlined style={{ cursor: 'pointer', color: '#666' }} onClick={closeDrawer} />
                            </div>
                        }
                        placement="right"
                        onClose={closeDrawer}
                        open={drawerVisible}
                        width={isMobile ? '100%' : (isMobileOrTablet ? '90%' : '80%')}
                        closable={!submitLoading}
                        maskClosable={!submitLoading}
                        footer={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 8,
                                padding: isMobile ? '12px 16px' : '12px 24px'
                            }}>
                                <Button
                                    onClick={closeDrawer}
                                    disabled={submitLoading}
                                    size={isMobile ? 'middle' : 'large'}
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSave}
                                    loading={submitLoading}
                                    disabled={submitLoading}
                                    size={isMobile ? 'middle' : 'large'}
                                    style={{ backgroundColor: '#00bcd4' }}
                                >
                                    {submitLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                                </Button>
                            </div>
                        }
                        styles={{
                            body: {
                                padding: isMobile ? '16px' : '24px 32px',
                                overflowY: 'auto',
                                maxHeight: 'calc(100vh - 108px)',
                                opacity: submitLoading ? 0.7 : 1,
                                pointerEvents: submitLoading ? 'none' : 'auto'
                            }
                        }}
                    >
                        <Spin spinning={submitLoading} tip="Đang xử lý...">
                            {/* Tiêu đề */}
                            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                                <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                    Tiêu đề <span style={{ color: '#ff4d4f' }}>*</span>
                                </Text>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nhập tiêu đề bài tập"
                                    size={isMobile ? 'middle' : 'large'}
                                    disabled={submitLoading}
                                />
                            </div>

                            {/* Loại bài tập và Điểm */}
                            <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 0]} style={{ marginBottom: isMobile ? 16 : 24 }}>
                                <Col xs={24} md={18}>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                        Loại bài tập: <span style={{ color: '#ff4d4f' }}>*</span>
                                    </Text>
                                    <Select
                                        value={formData.type}
                                        onChange={(value) => setFormData({ ...formData, type: value })}
                                        placeholder="Chọn loại bài tập"
                                        style={{ width: '100%' }}
                                        size={isMobile ? 'middle' : 'large'}
                                        disabled={submitLoading}
                                    >
                                        <Option value="normal">Normal</Option>
                                        <Option value="quiz">Quiz</Option>
                                        <Option value="code">Code</Option>
                                    </Select>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                        Điểm <span style={{ color: '#ff4d4f' }}>*</span>
                                    </Text>
                                    <InputNumber
                                        min={1}
                                        max={100}
                                        value={formData.points}
                                        onChange={(value) => setFormData({ ...formData, points: value || 1 })}
                                        style={{ width: '100%' }}
                                        size={isMobile ? 'middle' : 'large'}
                                        disabled={submitLoading}
                                    />
                                </Col>
                            </Row>

                            {/* Thời gian mở và đóng */}
                            {formData.type && (
                                <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 0]} style={{ marginBottom: isMobile ? 16 : 24 }}>
                                    <Col xs={24} md={12}>
                                        <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Thời gian mở
                                        </Text>
                                        <DatePicker
                                            showTime
                                            value={formData.openTime}
                                            onChange={(value) => setFormData({ ...formData, openTime: value })}
                                            format="DD/MM/YYYY HH:mm"
                                            placeholder="Chọn thời gian mở"
                                            style={{ width: '100%' }}
                                            size={isMobile ? 'middle' : 'large'}
                                            disabled={submitLoading}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Thời gian đóng
                                        </Text>
                                        <DatePicker
                                            showTime
                                            value={formData.closeTime}
                                            onChange={(value) => setFormData({ ...formData, closeTime: value })}
                                            format="DD/MM/YYYY HH:mm"
                                            placeholder="Chọn thời gian đóng"
                                            style={{ width: '100%' }}
                                            size={isMobile ? 'middle' : 'large'}
                                            disabled={submitLoading}
                                        />
                                    </Col>
                                </Row>
                            )}

                            {/* Màu sắc */}
                            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                                <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 12, fontWeight: 500 }}>
                                    Màu sắc
                                </Text>
                                <div style={{ display: 'flex', gap: isMobile ? 6 : 10, flexWrap: 'wrap' }}>
                                    {colors.slice(0, isMobile ? 10 : 20).map(color => (
                                        <Tooltip key={color} title={color}>
                                            <div
                                                onClick={() => !submitLoading && setFormData({ ...formData, color })}
                                                style={{
                                                    width: isMobile ? 28 : 32,
                                                    height: isMobile ? 28 : 32,
                                                    borderRadius: '50%',
                                                    backgroundColor: color,
                                                    border: color === '#ffffff' ? '2px solid #d9d9d9' : 'none',
                                                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                                                    boxShadow: formData.color === color ? '0 0 0 3px #00bcd4' : 'none',
                                                    transition: 'all 0.2s ease',
                                                    transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                                                    opacity: submitLoading ? 0.5 : 1
                                                }}
                                            >
                                                {formData.color === color && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: isMobile ? 8 : 10,
                                                        height: isMobile ? 8 : 10,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#fff',
                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                    }} />
                                                )}
                                            </div>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                            {/* Yêu cầu / Hướng dẫn và Chọn học sinh */}
                            <Row gutter={[isMobile ? 16 : 24, isMobile ? 16 : 24]} style={{ marginBottom: isMobile ? 16 : 24 }}>
                                {/* Cột trái: Yêu cầu */}
                                <Col xs={24} md={12}>
                                    <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                        Yêu cầu / Hướng dẫn
                                    </Text>

                                    {/* Text Editor Toolbar */}
                                    <div style={{
                                        display: 'flex',
                                        gap: 2,
                                        marginBottom: 8,
                                        padding: isMobile ? '6px' : '8px',
                                        backgroundColor: '#fafafa',
                                        borderRadius: '4px 4px 0 0',
                                        border: '1px solid #d9d9d9',
                                        borderBottom: 'none',
                                        flexWrap: 'wrap'
                                    }}>
                                        <Select defaultValue="Normal" size="small" style={{ width: isMobile ? 80 : 100 }}>
                                            <Option value="Normal">Normal</Option>
                                            <Option value="Heading1">H1</Option>
                                            <Option value="Heading2">H2</Option>
                                        </Select>
                                        <Select defaultValue="Normal" size="small" style={{ width: isMobile ? 80 : 100 }}>
                                            <Option value="Normal">Normal</Option>
                                            <Option value="Arial">Arial</Option>
                                        </Select>

                                        <Space size={2} wrap>
                                            <Button size="small" icon={<FontColorsOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<BoldOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<ItalicOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<UnderlineOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<OrderedListOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<UnorderedListOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<AlignLeftOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<AlignCenterOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<AlignRightOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<PictureOutlined />} disabled={submitLoading} />
                                            <Button size="small" icon={<LinkOutlined />} disabled={submitLoading} />
                                        </Space>
                                    </div>

                                    <Input.TextArea
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        placeholder="Nhập yêu cầu / hướng dẫn"
                                        rows={isMobile ? 4 : 6}
                                        style={{ borderRadius: '0 0 4px 4px' }}
                                        disabled={submitLoading}
                                    />
                                    <Text style={{ fontSize: '11px', color: '#999', marginTop: 4, display: 'block' }}>
                                        Hỗ trợ định dạng: Ctrl+B (In đậm), Ctrl+I (Nghiêng), Ctrl+U (Gạch chân)
                                    </Text>
                                </Col>

                                {/* Cột phải: Chọn học sinh */}
                                <Col xs={24} md={12}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                            Chọn học sinh giao bài
                                        </Text>
                                        <Tag color="blue">Đã chọn: {formData.selectedStudents.length}/{studentData.length}</Tag>
                                    </div>

                                    <Table
                                        rowSelection={{
                                            type: 'checkbox',
                                            selectedRowKeys: formData.selectedStudents,
                                            onChange: (selectedRowKeys) => setFormData({ ...formData, selectedStudents: selectedRowKeys }),
                                            getCheckboxProps: () => ({
                                                disabled: submitLoading,
                                            }),
                                        }}
                                        columns={studentColumns}
                                        dataSource={studentData}
                                        pagination={false}
                                        size="small"
                                        scroll={{ y: isMobile ? 150 : 240 }}
                                    />
                                </Col>
                            </Row>

                            {/* Chọn bài tập từ thư viện */}
                            <div>
                                <Button
                                    type={formData.useLibrary ? 'primary' : 'default'}
                                    icon={<BookOutlined />}
                                    onClick={() => !submitLoading && setFormData({ ...formData, useLibrary: !formData.useLibrary })}
                                    size={isMobile ? 'middle' : 'large'}
                                    disabled={submitLoading}
                                    block={isMobile}
                                    style={{
                                        backgroundColor: formData.useLibrary ? '#00bcd4' : undefined,
                                        borderColor: formData.useLibrary ? '#00bcd4' : undefined
                                    }}
                                >
                                    {formData.useLibrary ? 'Đã chọn bài tập từ thư viện' : 'Chọn bài tập từ thư viện'}
                                </Button>
                                {!formData.useLibrary && (
                                    <Text style={{ fontSize: '12px', color: '#ff4d4f', display: 'block', marginTop: 8 }}>
                                        Chưa chọn bài tập từ thư viện
                                    </Text>
                                )}
                            </div>
                        </Spin>
                    </Drawer>
                )}
            </Layout>
        </Layout>
    );
}

export default ClassDetail;