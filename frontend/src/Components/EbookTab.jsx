// Components/EbookTab.jsx
import React from 'react';
import { Row, Col, Card, Tag, message } from 'antd';

const EbookTab = ({ isMobile }) => {
    return (
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
                            <Card.Meta title={`Sách giáo khoa ${item}`} description="Nhà xuất bản Giáo dục" />
                            <div style={{ marginTop: 12 }}>
                                <Tag color="blue">Lớp {Math.floor(Math.random() * 5) + 6}</Tag>
                                <Tag color="green">Còn hàng</Tag>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default EbookTab;