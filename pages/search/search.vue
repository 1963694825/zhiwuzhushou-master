<template>
	<view class="search-page">
		<custom-navbar :title="'搜索 \'' + query + '\''" bgColor="#FFFFFF" :showBack="true"></custom-navbar>
		
		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 结果统计 -->
			<view class="result-stats">
				<text class="stats-text">为您找到 <text class="highlight">{{ varieties.length }}</text> 个相关品种</text>
			</view>

			<!-- 品种列表 -->
			<view class="varieties-grid">
				<view class="variety-card" v-for="(item, index) in varieties" :key="index">
					<view class="image-box">
						<image :src="item.image" mode="aspectFill" class="variety-image"></image>
						<text class="category-tag">{{ category }}</text>
					</view>
					<view class="info-box">
						<view class="title-row">
							<uni-icons type="flower" size="16" color="#22c55e"></uni-icons>
							<text class="name">{{ item.name }}</text>
						</view>
						<text class="latin-name">{{ item.latinName }}</text>
						<text class="desc">{{ item.description }}</text>
						<view class="detail-btn">查看详情</view>
					</view>
				</view>
			</view>

			<view class="footer-tip">
				<text>已经到底了～</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				query: '',
				category: '搜索结果',
				varieties: [],
				plantData: {
					"兰花": [
						{
							name: "蝴蝶兰",
							latinName: "Phalaenopsis",
							image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
							description: "花形优美，色彩艳丽，是最受欢迎的兰花品种之一"
						},
						{
							name: "鬼兰",
							latinName: "Dendrophylax lindenii",
							image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
							description: "珍稀濒危品种，花朵洁白神秘"
						}
					],
					"多肉": [
						{
							name: "景天",
							latinName: "Sedum",
							image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
							description: "叶片肥厚，易于养护"
						}
					]
				}
			};
		},
		onLoad(options) {
			this.query = options.q || '兰花';
			this.initSearch();
			
			const systemInfo = uni.getSystemInfoSync();
			this.navBarHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			initSearch() {
				// 模拟搜索逻辑
				let matched = false;
				for (let key in this.plantData) {
					if (key.includes(this.query) || this.query.includes(key)) {
						this.category = key;
						this.varieties = this.plantData[key];
						matched = true;
						break;
					}
				}
				if (!matched) {
					this.category = "推荐品种";
					this.varieties = this.plantData["兰花"];
				}
			}
		}
	}
</script>

<style lang="scss">
	.search-page {
		min-height: 100vh;
		background-color: #f8f9fa;

		.result-stats {
			background-color: #f0fdf4;
			padding: 24rpx 40rpx;
			border-bottom: 1rpx solid #dcfce7;

			.stats-text {
				font-size: 26rpx;
				color: #15803d;

				.highlight {
					font-weight: 600;
					margin: 0 4rpx;
				}
			}
		}

		.varieties-grid {
			padding: 30rpx;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;

			.variety-card {
				background-color: #ffffff;
				border-radius: 24rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.03);

				.image-box {
					position: relative;
					height: 300rpx;

					.variety-image {
						width: 100%;
						height: 100%;
					}

					.category-tag {
						position: absolute;
						top: 16rpx;
						right: 16rpx;
						background-color: #22c55e;
						color: #ffffff;
						font-size: 20rpx;
						padding: 4rpx 12rpx;
						border-radius: 20rpx;
					}
				}

				.info-box {
					padding: 20rpx;

					.title-row {
						display: flex;
						align-items: center;
						margin-bottom: 8rpx;

						.name {
							font-size: 28rpx;
							font-weight: 600;
							color: $primary-color;
							margin-left: 8rpx;
						}
					}

					.latin-name {
						font-size: 22rpx;
						color: #999;
						font-style: italic;
						margin-bottom: 16rpx;
						display: block;
					}

					.desc {
						font-size: 22rpx;
						color: #666;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						overflow: hidden;
						margin-bottom: 20rpx;
						height: 64rpx;
					}

					.detail-btn {
						background-color: #f0fdf4;
						color: #16a34a;
						font-size: 24rpx;
						text-align: center;
						padding: 12rpx 0;
						border-radius: 12rpx;
					}
				}
			}
		}

		.footer-tip {
			text-align: center;
			padding: 60rpx 0;
			color: #ccc;
			font-size: 24rpx;
		}
	}
</style>
