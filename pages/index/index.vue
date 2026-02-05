<template>
	<view class="home-page">
		<!-- 自定义导航栏 -->
		

		<!-- 页面内容，留出导航栏高度 -->
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- Logo和标题区域 -->
			<view class="header-section">
				<view class="logo-box">
					<image src="/static/1.png" mode="aspectFit" class="logo-img"></image>
				</view>
				<text class="title">植物百科</text>
				<text class="subtitle">探索大自然的奥秘</text>
			</view>

			<!-- 搜索区 (如果导航栏没有搜索，或者作为页面的主要入口) -->
			<!-- 根据 Figma 源码及通常小程序逻辑，首页中间也有个搜索入口 -->
			<view class="search-section">
				<view class="search-bar">
					<uni-icons type="search" size="20" color="#717182"></uni-icons>
					<input 
						type="text" 
						v-model="searchKeyword" 
						placeholder="搜索植物名称，例如：兰花" 
						class="search-input"
						confirm-type="search"
						@confirm="onSearch"
					/>
					<view class="camera-btn" @tap.stop="handleCamera">
						<uni-icons type="camera-filled" size="20" color="#030213"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 快捷功能 -->
			<view class="quick-actions">
				<view class="action-item" v-for="(item, index) in quickActions" :key="index" @tap="handleAction(item)">
					<view class="action-icon" :style="{ backgroundColor: item.bgColor }">
						<uni-icons :type="item.icon" size="28" color="#FFFFFF"></uni-icons>
					</view>
					<text class="action-label">{{ item.label }}</text>
				</view>
			</view>

			<!-- 今日推荐 -->
			<view class="recommend-section">
				<view class="section-header">
					<view class="title-left">
						<view class="icon-bg">
							<text class="sun-icon">☀</text>
						</view>
						<text class="section-title">今日推荐</text>
					</view>
					<text class="more-btn">查看更多</text>
				</view>

				<view class="recommend-grid">
					<view class="recommend-card" v-for="(item, index) in recommendations" :key="index">
						<view class="image-wrapper">
							<text class="badge" v-if="item.badge">{{ item.badge }}</text>
							<image :src="item.image" mode="aspectFill" class="plant-image"></image>
						</view>
						<view class="card-info">
							<text class="plant-name">{{ item.title }}</text>
							<text class="plant-desc">{{ item.description }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 自定义 TabBar -->
			<custom-tabbar currentPath="pages/index/index"></custom-tabbar>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				quickActions: [
					{ icon: 'camera', label: '花草识别', bgColor: '#3b82f6' },
					{ icon: 'paperplane', label: '养护指南', bgColor: '#22c55e' },
					{ icon: 'calendar-filled', label: '每日一花', bgColor: '#f97316' },
					{ icon: 'chat-filled', label: '植物医生', bgColor: '#ef4444' }
				],
				recommendations: [
					{
						id: 1,
						title: "多肉养护指南",
						description: "新手也能轻松掌握的秘籍",
						image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						badge: "推荐"
					},
					{
						id: 2,
						title: "春季室内植物图",
						description: "带你发现身边的美天",
						image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						badge: "推荐"
					}
				],
				searchKeyword: '',
				baseUrl: 'http://192.168.110.204:9000'
			};
		},
		onLoad() {
			// 获取导航栏高度以设置 paddingTop
			// 实际项目中可以优化为全局混入或 Store 存储
			const systemInfo = uni.getSystemInfoSync();
			const statusBarHeight = systemInfo.statusBarHeight;
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.navBarHeight = statusBarHeight + (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
			// #endif
			// #ifndef MP-WEIXIN
			this.navBarHeight = statusBarHeight + 44;
			// #endif
		},
		methods: {
			onSearch() {
				if (!this.searchKeyword.trim()) return;
				console.log('搜索中:', this.searchKeyword);
				uni.navigateTo({
					url: `/pages/search/search?q=${this.searchKeyword}`
				});
			},
			handleCamera() {
				console.log('触发了搜索栏相机图标点击');
				this.selectImage();
			},
			handleAction(item) {
				console.log('触发了快捷菜单点击:', item.label);
				if (item.label === '花草识别') {
					this.selectImage();
				} else {
					uni.showToast({ title: `${item.label}功能开发中`, icon: 'none' });
				}
			},
			selectImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePaths = res.tempFilePaths;
						this.uploadAndIdentify(tempFilePaths[0]);
					}
				});
			},

			uploadAndIdentify(filePath) {
				uni.showLoading({ title: 'AI 识别中...', mask: true });
				
				uni.uploadFile({
					url: this.baseUrl + '/api/identify/plant',
					filePath: filePath,
					name: 'image',
					success: (uploadRes) => {
						uni.hideLoading();
						try {
							const data = JSON.parse(uploadRes.data);
							if (data.code === 200) {
								// 跳转到结果页，传递识别数据
								uni.navigateTo({
									url: '/pages/identify/result?data=' + encodeURIComponent(JSON.stringify(data.data)) + '&image=' + encodeURIComponent(filePath)
								});
							} else {
								uni.showToast({ title: data.message || '识别失败', icon: 'none' });
							}
						} catch (e) {
							console.error('解析响应失败:', e);
							uni.showToast({ title: '服务器响应异常', icon: 'none' });
						}
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('上传失败详情:', err);
						uni.showToast({ 
							title: '请检查网络连接', 
							icon: 'none'
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.home-page {
		min-height: 100vh;
		background-color: #ffffff;

		.content {
			display: flex;
			flex-direction: column;
		}

		.header-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 60rpx 0 40rpx;

			.logo-box {
				width: 320rpx;
				height: 120rpx;
				background: transparent;
				border: 2rpx solid #e5e7eb;
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 30rpx;
				overflow: hidden;

				.logo-img {
					width: 90%;
					height: 90%;
				}
			}

			.title {
				font-size: 42rpx;
				font-weight: 600;
				color: $primary-color;
				margin-bottom: 10rpx;
			}

			.subtitle {
				font-size: 28rpx;
				color: $muted-color;
			}
		}

		.search-section {
			padding: 0 40rpx;
			margin-bottom: 60rpx;

			.search-bar {
				display: flex;
				align-items: center;
				background-color: #f3f3f5;
				height: 100rpx;
				border-radius: 50rpx;
				padding: 0 30rpx;
				box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);

				.search-input {
					flex: 1;
					font-size: 28rpx;
					color: #333;
					margin-left: 20rpx;
				}

				.camera-btn {
					width: 70rpx;
					height: 70rpx;
					background-color: #ffffff;
					border-radius: 35rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
				}
			}
		}

		.quick-actions {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			padding: 0 30rpx;
			margin-bottom: 60rpx;

			.action-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				.action-icon {
					width: 110rpx;
					height: 110rpx;
					border-radius: 32rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 6rpx 12rpx rgba(0,0,0,0.08);
					margin-bottom: 16rpx;
					transition: transform 0.2s;

					&:active {
						transform: scale(0.95);
					}
				}

				.action-label {
					font-size: 24rpx;
					color: #444;
				}
			}
		}

		.recommend-section {
			padding: 0 40rpx;

			.section-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 30rpx;

				.title-left {
					display: flex;
					align-items: center;

					.icon-bg {
						width: 48rpx;
						height: 48rpx;
						background-color: #fff7ed;
						border-radius: 24rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 16rpx;

						.sun-icon {
							color: #f97316;
							font-size: 24rpx;
						}
					}

					.section-title {
						font-size: 32rpx;
						font-weight: 600;
						color: $primary-color;
					}
				}

				.more-btn {
					font-size: 26rpx;
					color: $muted-color;
				}
			}

			.recommend-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 30rpx;
				padding-bottom: 40rpx;

				.recommend-card {
					background: linear-gradient(135deg, #fff1f2 0%, #eff6ff 100%);
					border-radius: 32rpx;
					overflow: hidden;
					box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);

					.image-wrapper {
						position: relative;
						height: 240rpx;

						.badge {
							position: absolute;
							top: 16rpx;
							left: 16rpx;
							background-color: #22c55e;
							color: #ffffff;
							font-size: 20rpx;
							padding: 4rpx 16rpx;
							border-radius: 20rpx;
							z-index: 1;
						}

						.plant-image {
							width: 100%;
							height: 100%;
						}
					}

					.card-info {
						padding: 24rpx;

						.plant-name {
							font-size: 28rpx;
							font-weight: 500;
							color: $primary-color;
							margin-bottom: 8rpx;
							display: block;
						}

						.plant-desc {
							font-size: 22rpx;
							color: $muted-color;
						}
					}
				}
			}
		}
	}
</style>
