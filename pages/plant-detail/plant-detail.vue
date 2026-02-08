<template>
	<view class="detail-page">
		<!-- 顶部大图 -->
		<view class="header-image">
			<image :src="plantData.image_url || '/static/plant-placeholder.png'" mode="aspectFill" class="bg-image"></image>
			<view class="overlay"></view>
			<custom-navbar title="植物详情" bgColor="transparent" :showBack="true"></custom-navbar>
		</view>

		<!-- 内容区域 -->
		<view class="content-wrapper" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 基本信息卡片 -->
			<view class="info-card">
				<view class="plant-name">
					<text class="common-name">{{ plantData.common_name_zh || plantData.common_name || '未知植物' }}</text>
					<text class="scientific-name">{{ plantData.scientific_name }}</text>
				</view>
				
				<view class="meta-info">
					<view class="meta-item">
						<uni-icons type="list" size="16" color="#22c55e"></uni-icons>
						<text class="meta-label">科属</text>
						<text class="meta-value">{{ plantData.family }} / {{ plantData.genus }}</text>
					</view>
					<view class="meta-item" v-if="plantData.english_name">
						<uni-icons type="flag" size="16" color="#22c55e"></uni-icons>
						<text class="meta-label">英文名</text>
						<text class="meta-value">{{ plantData.english_name }}</text>
					</view>
					<view class="meta-item" v-if="plantData.flowering_period">
						<uni-icons type="calendar" size="16" color="#22c55e"></uni-icons>
						<text class="meta-label">花期</text>
						<text class="meta-value">{{ plantData.flowering_period }}</text>
					</view>
					<view class="meta-item" v-if="plantData.year">
						<uni-icons type="calendar" size="16" color="#22c55e"></uni-icons>
						<text class="meta-label">发现年份</text>
						<text class="meta-value">{{ plantData.year }}</text>
					</view>
					<view class="meta-item" v-if="plantData.author">
						<uni-icons type="person" size="16" color="#22c55e"></uni-icons>
						<text class="meta-label">命名者</text>
						<text class="meta-value">{{ plantData.author }}</text>
					</view>
				</view>
			</view>

			<!-- 详细描述 -->
			<view class="section-card" v-if="plantData.observations">
				<view class="section-title">
					<uni-icons type="info" size="18" color="#22c55e"></uni-icons>
					<text>详细信息</text>
				</view>
				<text class="section-content">{{ plantData.observations_zh || plantData.observations }}</text>
			</view>

			<!-- 别名 -->
			<view class="section-card" v-if="plantData.alias">
				<view class="section-title">
					<uni-icons type="list" size="18" color="#22c55e"></uni-icons>
					<text>别名</text>
				</view>
				<view class="alias-list">
					<text class="alias-item" v-for="(name, index) in parseAlias(plantData.alias)" :key="index">{{ name }}</text>
				</view>
			</view>

			<!-- 简介 -->
			<view class="section-card" v-if="plantData.description">
				<view class="section-title">
					<uni-icons type="info" size="18" color="#22c55e"></uni-icons>
					<text>植物简介</text>
				</view>
				<text class="section-content">{{ plantData.description }}</text>
			</view>

			<!-- 植物学史 -->
			<view class="section-card" v-if="plantData.history">
				<view class="section-title">
					<uni-icons type="compose" size="18" color="#22c55e"></uni-icons>
					<text>植物学史</text>
				</view>
				<text class="section-content">{{ plantData.history }}</text>
			</view>

			<!-- 形态特征 -->
			<view class="section-card" v-if="plantData.morphology">
				<view class="section-title">
					<uni-icons type="eye" size="18" color="#22c55e"></uni-icons>
					<text>形态特征</text>
				</view>
				<text class="section-content">{{ plantData.morphology }}</text>
			</view>

			<!-- 生长环境 -->
			<view class="section-card" v-if="plantData.habitat">
				<view class="section-title">
					<uni-icons type="location" size="18" color="#22c55e"></uni-icons>
					<text>生长环境</text>
				</view>
				<text class="section-content">{{ plantData.habitat }}</text>
			</view>

			<!-- 分布地区 -->
			<view class="section-card" v-if="plantData.distribution">
				<view class="section-title">
					<uni-icons type="map-pin" size="18" color="#22c55e"></uni-icons>
					<text>分布地区</text>
				</view>
				<text class="section-content">{{ plantData.distribution }}</text>
			</view>

			<!-- 同义词 -->
			<view class="section-card" v-if="plantData.synonyms && plantData.synonyms.length > 0">
				<view class="section-title">
					<uni-icons type="list" size="18" color="#22c55e"></uni-icons>
					<text>同义词</text>
				</view>
				<view class="synonyms-list">
					<text class="synonym-item" v-for="(syn, index) in plantData.synonyms" :key="index">{{ syn }}</text>
				</view>
			</view>

			<!-- 百科链接 -->
			<view class="action-buttons" v-if="plantData.links">
				<button class="action-btn" @tap="openLink(plantData.links.self)">
					<uni-icons type="link" size="18" color="#ffffff"></uni-icons>
					<text>查看 Trefle 详情</text>
				</button>
			</view>

			<!-- 底部提示 -->
			<view class="footer-tip">
				<text>以上信息仅供参考</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				plantData: {},
				baseUrl: 'http://192.168.1.4:9000'
			};
		},
		onLoad(options) {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.navBarHeight = systemInfo.statusBarHeight + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;
			// #endif
			// #ifndef MP-WEIXIN
			this.navBarHeight = systemInfo.statusBarHeight + 44;
			// #endif

			// 获取传递的 slug
			if (options.slug) {
				this.fetchPlantDetail(options.slug);
			} else {
				uni.showToast({ title: '缺少植物信息', icon: 'none' });
			}
		},
		methods: {
			fetchPlantDetail(slug) {
				uni.showLoading({ title: '加载中...', mask: true });

				uni.request({
					url: `${this.baseUrl}/api/plants/detail/${slug}`,
					method: 'GET',
					success: (res) => {
						uni.hideLoading();
						if (res.data.code === 200) {
							this.plantData = res.data.data;
						} else {
							uni.showToast({ title: res.data.message || '加载失败', icon: 'none' });
						}
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('详情请求失败:', err);
						uni.showToast({ title: '网络连接失败', icon: 'none' });
					}
				});
			},
			parseAlias(aliasStr) {
				if (!aliasStr) return [];
				try {
					const parsed = JSON.parse(aliasStr);
					return Array.isArray(parsed) ? parsed : [];
				} catch (e) {
					return [];
				}
			},
			openLink(url) {
				if (!url) return;
				// 在小程序中复制链接
				uni.setClipboardData({
					data: `https://trefle.io${url}`,
					success: () => {
						uni.showToast({ title: '链接已复制', icon: 'success' });
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.detail-page {
		min-height: 100vh;
		background-color: #f8f9fa;
	}

	.header-image {
		position: relative;
		width: 100%;
		height: 500rpx;

		.bg-image {
			width: 100%;
			height: 100%;
		}

		.overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
		}
	}

	.content-wrapper {
		position: relative;
		margin-top: -100rpx;
		padding: 0 30rpx 30rpx;
	}

	.info-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.08);
		margin-bottom: 24rpx;

		.plant-name {
			margin-bottom: 30rpx;

			.common-name {
				display: block;
				font-size: 36rpx;
				font-weight: 600;
				color: #1d1d1f;
				margin-bottom: 12rpx;
			}

			.scientific-name {
				display: block;
				font-size: 26rpx;
				color: #86868b;
				font-style: italic;
			}
		}

		.meta-info {
			.meta-item {
				display: flex;
				align-items: center;
				padding: 16rpx 0;
				border-top: 1rpx solid #f5f5f7;

				&:first-child {
					border-top: none;
				}

				.meta-label {
					font-size: 24rpx;
					color: #86868b;
					margin-left: 12rpx;
					flex: 0 0 120rpx;
				}

				.meta-value {
					font-size: 26rpx;
					color: #1d1d1f;
					flex: 1;
				}
			}
		}
	}

	.section-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);

		.section-title {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			text {
				font-size: 28rpx;
				font-weight: 600;
				color: #1d1d1f;
				margin-left: 12rpx;
			}
		}

		.section-content {
			font-size: 26rpx;
			color: #515154;
			line-height: 1.8;
		}

		.synonyms-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.synonym-item {
				background-color: #f0fdf4;
				color: #15803d;
				font-size: 22rpx;
				padding: 8rpx 16rpx;
				border-radius: 12rpx;
			}
		}

		.alias-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.alias-item {
				background-color: #eff6ff;
				color: #1e40af;
				font-size: 22rpx;
				padding: 8rpx 16rpx;
				border-radius: 12rpx;
			}
		}
	}

	.footer-tip {
		text-align: center;
		padding: 60rpx 0;
		color: #94a3b8;
		font-size: 24rpx;
	}

	.action-buttons {
		padding: 20rpx 0;

		.action-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
			color: #ffffff;
			border: none;
			border-radius: 16rpx;
			padding: 24rpx;
			font-size: 28rpx;
			box-shadow: 0 8rpx 16rpx rgba(34, 197, 94, 0.3);

			text {
				margin-left: 12rpx;
			}
		}
	}
</style>
