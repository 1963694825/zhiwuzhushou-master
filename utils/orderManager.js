// 订单管理工具类
class OrderManager {
    constructor() {
        this.storageKey = 'orders';
    }

    // 保存订单
    saveOrder(order) {
        let orders = uni.getStorageSync(this.storageKey) || [];
        const index = orders.findIndex(o => o.id === order.id);
        if (index > -1) {
            orders[index] = order;
        } else {
            orders.unshift(order);
        }
        uni.setStorageSync(this.storageKey, orders);
        return order;
    }

    // 获取订单列表
    getOrders(status = -1) {
        let orders = uni.getStorageSync(this.storageKey) || [];
        if (status === -1) return orders;
        return orders.filter(o => o.status === status);
    }

    // 获取订单详情
    getOrderById(id) {
        const orders = uni.getStorageSync(this.storageKey) || [];
        return orders.find(o => o.id === id);
    }

    // 更新订单状态
    updateOrderStatus(orderId, status, extraData = {}) {
        const order = this.getOrderById(orderId);
        if (order) {
            order.status = status;
            order.statusText = this.getStatusText(status);
            Object.assign(order, extraData);
            this.saveOrder(order);
            return true;
        }
        return false;
    }

    // 删除订单
    deleteOrder(orderId) {
        let orders = uni.getStorageSync(this.storageKey) || [];
        orders = orders.filter(o => o.id !== orderId);
        uni.setStorageSync(this.storageKey, orders);
    }

    // 获取订单统计
    getOrderStats() {
        const orders = uni.getStorageSync(this.storageKey) || [];
        return {
            unpaid: orders.filter(o => o.status === 0).length,
            paid: orders.filter(o => o.status === 1).length,
            shipped: orders.filter(o => o.status === 2).length,
            received: orders.filter(o => o.status === 3).length,
            refunding: orders.filter(o => o.status === 6).length
        };
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            0: '待付款',
            1: '待发货',
            2: '待收货',
            3: '待评价',
            4: '已完成',
            5: '已取消',
            6: '退款中',
            7: '已退款',
            8: '退货中',
            9: '已退货',
            10: '已关闭'
        };
        return statusMap[status] || '未知状态';
    }

    // 获取状态颜色
    getStatusColor(status) {
        const colorMap = {
            0: '#f97316',
            1: '#3b82f6',
            2: '#22c55e',
            3: '#a855f7',
            4: '#64748b',
            5: '#ef4444',
            6: '#f59e0b',
            7: '#64748b',
            8: '#f59e0b',
            9: '#64748b',
            10: '#64748b'
        };
        return colorMap[status] || '#64748b';
    }

    // 初始化模拟数据
    initMockData() {
        const mockOrders = [
            {
                id: '1',
                orderNo: 'DD202402060001',
                userId: 'user123',
                status: 0,
                statusText: '待付款',
                createTime: '2024-02-06 10:30:00',
                payTime: '',
                shipTime: '',
                receiveTime: '',
                shopId: 'shop001',
                shopName: '绿植花卉专营店',
                products: [
                    {
                        productId: 1,
                        name: '蝴蝶兰盆栽',
                        image: 'https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?w=400',
                        specs: '标准款',
                        quantity: 1,
                        price: 219.0
                    }
                ],
                totalAmount: 219.0,
                freight: 10.0,
                discountAmount: 0,
                actualAmount: 229.0,
                address: {
                    name: '张三',
                    phone: '13800138000',
                    province: '广东省',
                    city: '深圳市',
                    district: '南山区',
                    detail: '科技园南区XX路XX号'
                }
            },
            {
                id: '2',
                orderNo: 'DD202402050002',
                userId: 'user123',
                status: 2,
                statusText: '待收货',
                createTime: '2024-02-05 14:20:00',
                payTime: '2024-02-05 14:22:00',
                shipTime: '2024-02-05 16:00:00',
                receiveTime: '',
                shopId: 'shop001',
                shopName: '绿植花卉专营店',
                products: [
                    {
                        productId: 2,
                        name: '多肉组合盆栽',
                        image: 'https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?w=400',
                        specs: '豪华款',
                        quantity: 1,
                        price: 348.0
                    }
                ],
                totalAmount: 348.0,
                freight: 10.0,
                discountAmount: 0,
                actualAmount: 358.0,
                address: {
                    name: '张三',
                    phone: '13800138000',
                    province: '广东省',
                    city: '深圳市',
                    district: '南山区',
                    detail: '科技园南区XX路XX号'
                },
                logistics: {
                    company: '顺丰速运',
                    trackingNo: 'SF1234567890',
                    status: '运输中'
                }
            },
            {
                id: '3',
                orderNo: 'DD202402040003',
                userId: 'user123',
                status: 4,
                statusText: '已完成',
                createTime: '2024-02-04 09:15:00',
                payTime: '2024-02-04 09:17:00',
                shipTime: '2024-02-04 11:00:00',
                receiveTime: '2024-02-05 10:30:00',
                finishTime: '2024-02-05 10:30:00',
                shopId: 'shop001',
                shopName: '绿植花卉专营店',
                products: [
                    {
                        productId: 3,
                        name: '室内绿植套装',
                        image: 'https://images.unsplash.com/photo-1651807193045-1b366e7f347f?w=400',
                        specs: '标准款',
                        quantity: 1,
                        price: 200.0
                    }
                ],
                totalAmount: 200.0,
                freight: 10.0,
                discountAmount: 0,
                actualAmount: 210.0,
                address: {
                    name: '张三',
                    phone: '13800138000',
                    province: '广东省',
                    city: '深圳市',
                    district: '南山区',
                    detail: '科技园南区XX路XX号'
                }
            }
        ];

        uni.setStorageSync(this.storageKey, mockOrders);
        return mockOrders;
    }
}

export default new OrderManager();
