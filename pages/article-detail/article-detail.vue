<template>
	<view class="article-detail-page">
		<custom-navbar title="文章详情" bgColor="#FFFFFF" :showBack="true"></custom-navbar>
		
		<view class="content-wrapper" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 骨架屏加载状态 -->
			<view v-if="isLoading" class="loading-state">
				<uni-icons type="spinner-cycle" size="30" color="#94a3b8" class="spin-icon"></uni-icons>
			</view>

			<block v-else>
				<!-- 文章头部 -->
				<view class="article-header">
					<text class="title">{{ article.title }}</text>
					<view class="meta-row">
						<text class="tag">{{ article.knowledge_type || '科普' }}</text>
						<text class="date">{{ formatDate(article.publish_time) }}</text>
						<text class="views">{{ article.views || 100 }} 阅读</text>
					</view>
				</view>

				<!-- 多图轮播 (如果有图片) -->
				<view class="image-gallery" v-if="articleImages.length > 0">
					<swiper class="gallery-swiper" :indicator-dots="true" :autoplay="false" circular indicator-active-color="#16a34a">
						<swiper-item v-for="(img, index) in articleImages" :key="index">
							<image :src="img" mode="aspectFill" class="gallery-image" @tap="previewImage(index)"></image>
						</swiper-item>
					</swiper>
					<view class="image-count">{{ articleImages.length }} 张图片</view>
				</view>

				<!-- 文章内容 -->
				<view class="article-content">
					<!-- 本地导入的文章内容通常是纯文本，需要处理换行 -->
					<text class="text-content" space="nbsp">{{ article.content }}</text>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				articleId: null,
				article: {},
				isLoading: true,
				baseUrl: 'http://192.168.110.203:9000'
			};
		},
		computed: {
			articleImages() {
				if (!this.article.images) return [];
				// 如果是 JSON 字符串，尝试解析
				if (typeof this.article.images === 'string') {
					try {
						return JSON.parse(this.article.images);
					} catch (e) {
						return [this.article.images]; // 可能是单张图片 URL
					}
				}
				// 如果已经是数组
				if (Array.isArray(this.article.images)) {
					return this.article.images;
				}
				return [];
			}
		},
		onLoad(options) {
			this.calculateNavHeight();
			if (options.id) {
				this.articleId = options.id;
				this.fetchArticleDetail();
			} else {
				uni.showToast({ title: '参数错误', icon: 'none' });
				setTimeout(() => uni.navigateBack(), 1500);
			}
		},
		methods: {
			calculateNavHeight() {
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

			async fetchArticleDetail() {
				this.isLoading = true;
				// 由于后端目前只有 /api/knowledge/articles/:species_id (获取列表)
				// 我们需要一个获取单篇文章详情的接口，或者从列表中筛选
				// 临时方案：这里演示如果还没有单篇接口，我们可以复用列表接口或者假设有单篇接口
				// 既然我们的目标是展示详情，我建议后端应该有一个 /api/knowledge/article/:id 接口
				// 但根据 dev plan，我们似乎没有明确添加这个接口。
				// 不过，我们可以尝试请求列表并在前端筛选，或者直接添加这个接口。
				
				// 让我们先假设 URL 是 /api/knowledge/article/detail/:id
				// 如果后端没写，我现在去写后端。
				
				// 检查 Implementation Plan，我在 Plan 中写了：
				// "升级 /api/knowledge/articles/:id 接口" -> 这是获取列表的接口被占用了 (param是 species_id)
				// 所以我必须创建一个新接口 /api/knowledge/article/:id 来获取单篇详情
				
				try {
					const res = await uni.request({
						url: `${this.baseUrl}/api/knowledge/article/${this.articleId}`
					});
					if (res.data.code === 200) {
						this.article = res.data.data;
					} else {
						uni.showToast({ title: '获取详情失败', icon: 'none' });
					}
				} catch (e) {
					console.error('API Error:', e);
					uni.showToast({ title: '网络错误', icon: 'none' });
				} finally {
					this.isLoading = false;
				}
			},

			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.articleImages
				});
			},

			formatDate(isoString) {
				if (!isoString) return '';
				const date = new Date(isoString);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.article-detail-page {
		min-height: 100vh;
		background-color: #ffffff;

		.content-wrapper {
			padding: 0 40rpx 60rpx;
		}

		.loading-state {
			display: flex;
			justify-content: center;
			padding-top: 200rpx;
			.spin-icon {
				animation: spin 1s linear infinite;
			}
		}

		.article-header {
			padding: 40rpx 0;
			border-bottom: 1rpx solid #f1f5f9;

			.title {
				font-size: 40rpx;
				font-weight: 700;
				color: #1e293b;
				line-height: 1.4;
				display: block;
				margin-bottom: 24rpx;
			}

			.meta-row {
				display: flex;
				align-items: center;
				gap: 20rpx;
				font-size: 24rpx;
				color: #94a3b8;

				.tag {
					color: #16a34a;
					background-color: #f0fdf4;
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
				}
			}
		}

		.image-gallery {
			margin: 40rpx 0;
			position: relative;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 12rpx 24rpx rgba(0,0,0,0.06);

			.gallery-swiper {
				width: 100%;
				height: 500rpx;
				background-color: #f8fafc;

				.gallery-image {
					width: 100%;
					height: 100%;
				}
			}
			
			.image-count {
				position: absolute;
				bottom: 20rpx;
				right: 20rpx;
				background-color: rgba(0,0,0,0.6);
				color: #fff;
				font-size: 22rpx;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
			}
		}

		.article-content {
			margin-top: 40rpx;
            
			.text-content {
				font-size: 30rpx;
				color: #334155;
				line-height: 1.8;
				text-align: justify;
                white-space: pre-wrap; /* 保留换行符 */
			}
		}

		@keyframes spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
	}
</style>
