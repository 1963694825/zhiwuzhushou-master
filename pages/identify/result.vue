<template>
	<view class="identify-result">
		<custom-navbar title="识别结果" showBack bg-color="transparent" :title-color="'#ffffff'"></custom-navbar>
		
		<!-- 沉浸式背景层 -->
		<view class="bg-layer">
			<image :src="userImage" mode="aspectFill" class="bg-image"></image>
			<view class="bg-mask"></view>
		</view>

		<scroll-view scroll-y class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 顶部占位，让内容从下方开始 -->
			<view class="spacer" :style="{ height: 'calc(40vh - ' + navBarHeight + 'px)' }"></view>

			<!-- 悬浮玻璃卡片 -->
			<view class="result-card">
				<!-- 原图悬浮小窗 -->
				<view class="image-preview" @tap="previewImage">
					<image :src="userImage" mode="aspectFill" class="user-thumb"></image>
					<view class="expand-icon">
						<uni-icons type="scan" size="16" color="#ffffff"></uni-icons>
					</view>
				</view>

				<view class="card-header">
					<view class="title-row">
						<text class="plant-name">{{ result.name || '未知植物' }}</text>
						<view class="confidence-badge">
							<text class="score">相似度 {{ (result.confidence * 100).toFixed(0) }}%</text>
						</view>
					</view>
					<text class="latin-name">拉丁学名: {{ result.latin_name || '暂无数据' }}</text>
				</view>
 
				<view class="info-section">
					<view class="section-item">
						<view class="section-header">
							<uni-icons type="info-filled" size="20" color="#22c55e"></uni-icons>
							<text class="section-title">植物简介</text>
						</view>
						<text class="section-content">{{ result.description || '暂无详细描述信息。' }}</text>
					</view>

					<view class="section-item">
						<view class="section-header">
							<uni-icons type="heart-filled" size="20" color="#fbbf24"></uni-icons>
							<text class="section-title">养护建议</text>
						</view>
						<text class="section-content">{{ result.care_tips || '建议查阅专业养护指南以获取更多信息。' }}</text>
					</view>
					
					<view class="baike-link" v-if="result.baike_url" @tap="openBaike">
						<text>查看更多百科信息</text>
						<uni-icons type="arrowright" size="14" color="#2563eb"></uni-icons>
					</view>
				</view>

				<view class="bottom-actions">
					<button class="action-btn secondary" @tap="goBack">
						<uni-icons type="camera" size="20" color="#64748b"></uni-icons>
						<text>再拍一次</text>
					</button>
					<button class="action-btn primary" @tap="saveRecord">
						<uni-icons type="checkbox-filled" size="20" color="#ffffff"></uni-icons>
						<text>存入日记</text>
					</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				userImage: '',
				result: {},
				isAnimationPlayed: false
			};
		},
		onLoad(options) {
			if (options.data) {
				try {
					this.result = JSON.parse(decodeURIComponent(options.data));
				} catch (e) {
					console.error('数据解析失败', e);
				}
			}
			if (options.image) {
				this.userImage = decodeURIComponent(options.image);
			}
			
			const systemInfo = uni.getSystemInfoSync();
			this.navBarHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			previewImage() {
				uni.previewImage({
					urls: [this.userImage]
				});
			},
			openBaike() {
				if(this.result.baike_url){
					// 小程序内无法直接跳转外链，通常复制链接或使用 web-view
					uni.setClipboardData({
						data: this.result.baike_url,
						success: () => {
							uni.showToast({ title: '百科链接已复制', icon: 'none' });
						}
					});
				}
			},
			saveRecord() {
				uni.showToast({
					title: '已保存到我的植物',
					icon: 'success'
				});
				// 实际逻辑待开发
			}
		}
	}
</script>

<style lang="scss">
	.identify-result {
		min-height: 100vh;
		position: relative;
		overflow: hidden;
	}

	.bg-layer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;

		.bg-image {
			width: 100%;
			height: 100%;
			filter: blur(15px) brightness(0.9); // 高斯模糊背景
			transform: scale(1.1); // 防止模糊边缘
		}

		.bg-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
		}
	}

	.content {
		position: relative;
		z-index: 2;
		height: 100vh;
	}

	.result-card {
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(10px);
		border-radius: 40rpx 40rpx 0 0;
		padding: 50rpx 40rpx 80rpx;
		min-height: 60vh;
		position: relative;
		box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.1);
		animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		
		.image-preview {
			position: absolute;
			right: 40rpx;
			top: -80rpx;
			width: 160rpx;
			height: 160rpx;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.2);
			border: 4rpx solid #ffffff;
			background-color: #f0f0f0;

			.user-thumb {
				width: 100%;
				height: 100%;
			}
			
			.expand-icon {
				position: absolute;
				bottom: 0;
				right: 0;
				background: rgba(0,0,0,0.5);
				padding: 4rpx 8rpx;
				border-radius: 10rpx 0 0 0;
			}
		}

		.card-header {
			margin-bottom: 50rpx;
			padding-right: 180rpx; // 避开图片区域

			.title-row {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 16rpx;
				margin-bottom: 12rpx;

				.plant-name {
					font-size: 48rpx;
					font-weight: bold;
					color: #1e293b;
				}

				.confidence-badge {
					background: linear-gradient(135deg, #22c55e, #16a34a);
					padding: 4rpx 16rpx;
					border-radius: 24rpx;
					
					.score {
						color: #ffffff;
						font-size: 22rpx;
						font-weight: 500;
					}
				}
			}

			.latin-name {
				font-size: 28rpx;
				color: #94a3b8;
				font-style: italic;
				font-family: serif;
			}
		}

		.info-section {
			.section-item {
				margin-bottom: 40rpx;
				
				.section-header {
					display: flex;
					align-items: center;
					gap: 12rpx;
					margin-bottom: 16rpx;

					.section-title {
						font-size: 32rpx;
						font-weight: 600;
						color: #334155;
					}
				}

				.section-content {
					font-size: 28rpx;
					color: #475569;
					line-height: 1.7;
					text-align: justify;
					display: block;
				}
			}
			
			.baike-link {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: 4rpx;
				margin-top: -20rpx;
				margin-bottom: 40rpx;
				
				text {
					font-size: 26rpx;
					color: #2563eb;
				}
			}
		}

		.bottom-actions {
			display: flex;
			gap: 30rpx;
			margin-top: 60rpx;

			.action-btn {
				flex: 1;
				height: 96rpx;
				border-radius: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				font-size: 30rpx;
				border: none;
				
				&::after {
					border: none;
				}

				&.secondary {
					background-color: #f1f5f9;
					color: #475569;
				}

				&.primary {
					background: linear-gradient(135deg, #22c55e, #15803d);
					color: #ffffff;
					box-shadow: 0 8rpx 20rpx rgba(34, 197, 94, 0.3);
				}
			}
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100vh);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
