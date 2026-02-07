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
						<view class="detail-btn" @tap="goToDetail(item)">查看详情</view>
					</view>
				</view>
			</view>

			<!-- 加载更多按钮 -->
			<view class="load-more" v-if="varieties.length > 0">
				<button class="load-more-btn" @tap="loadMore" v-if="hasMore && !isLoading">加载更多</button>
				<text class="loading-text" v-if="isLoading">加载中...</text>
			</view>

			<view class="footer-tip" v-if="!hasMore && varieties.length > 0">
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
				isLoading: false,
				baseUrl: 'http://localhost:9000',
				currentPage: 1,
				hasMore: true
			};
		},
		onLoad(options) {
			this.query = options.q || '';
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			// #ifdef MP-WEIXIN
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			this.navBarHeight = systemInfo.statusBarHeight + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;
			// #endif
			// #ifndef MP-WEIXIN
			this.navBarHeight = systemInfo.statusBarHeight + 44;
			// #endif

			if (this.query) {
				this.initSearch();
			}
		},
		methods: {
			initSearch(loadMore = false) {
				if (!loadMore) {
					this.currentPage = 1;
					this.varieties = [];
					this.hasMore = true;
				}
				
				this.isLoading = true;
				
				const url = `${this.baseUrl}/api/plants/search`;
				console.log('发起搜索请求 URL:', url);
				console.log('搜索关键词:', this.query);

				uni.showLoading({ title: '搜索中...', mask: true });

				uni.request({
					url: url,
					method: 'GET',
					data: {
						q: this.query,
						page: this.currentPage
					},
					success: (res) => {
						uni.hideLoading();
						
						if (res.data.code === 200) {
							// 映射 Trefle 数据格式
							const newItems = res.data.data.map(item => ({
								name: item.common_name_zh || item.common_name || item.scientific_name,
								latinName: item.scientific_name,
								image: item.image_url || '/static/plant-placeholder.png',
								description: `Family: ${item.family || 'Unknown'}`,
								slug: item.slug
							}));
							
							if (loadMore) {
								this.varieties = [...this.varieties, ...newItems];
							} else {
								this.varieties = newItems;
							}
							
							// 判断是否还有更多数据
							this.hasMore = newItems.length >= 1000;
							
							if (this.varieties.length === 0) {
								uni.showToast({ title: '未找到相关植物', icon: 'none' });
							}
						} else {
							uni.showToast({ title: res.data.message || '搜索服务异常', icon: 'none' });
						}
					},
					fail: (err) => {
						uni.hideLoading();
						console.error('搜索请求失败详情:', err);
						uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
					},
					complete: () => {
						this.isLoading = false;
					}
				});
			},
			goToDetail(item) {
				console.log('点击查看详情，item:', item);
				console.log('slug:', item.slug);
				
				if (!item.slug) {
					console.error('缺少 slug 信息');
					uni.showToast({ title: '缺少植物信息', icon: 'none' });
					return;
				}
				
				const url = `/pages/plant-detail/plant-detail?slug=${item.slug}`;
				console.log('准备跳转到:', url);
				
				uni.navigateTo({
					url: url,
					success: () => {
						console.log('跳转成功');
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						uni.showToast({ title: '跳转失败: ' + err.errMsg, icon: 'none' });
					}
				});
			},
			loadMore() {
				if (this.isLoading || !this.hasMore) return;
				this.currentPage++;
				this.initSearch(true);
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
