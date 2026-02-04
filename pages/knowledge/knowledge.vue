<template>
	<view class="knowledge-page">
		<!-- 头部固定布局 -->
		<view class="header-fixed-layout">
			<custom-navbar bgColor="#FFFFFF">
				<view class="nav-search-container">
					<view class="nav-search-box">
						<uni-icons type="search" size="16" color="#999"></uni-icons>
						<input type="text" placeholder="搜索种植知识" class="nav-input-inner" />
					</view>
				</view>
			</custom-navbar>
			
			<!-- 为吸顶的导航栏预留占位高度 -->
			<view :style="{ height: navHeaderHeight + 'px' }"></view>
			
			<!-- 分类标签栏 (解决红线缺失部分) -->
			<view class="knowledge-tabs-bar">
				<scroll-view scroll-x class="tabs-scroll-layer" :show-scrollbar="false">
					<view class="tab-item-chip active">全部知识</view>
					<view class="tab-item-chip">热门推荐</view>
					<view class="tab-item-chip">最新发布</view>
					<view class="tab-arrow-container">
						<uni-icons type="bottom" size="14" color="#666"></uni-icons>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 填充固定头部的空间 -->
		<view :style="{ height: (navHeaderHeight + 45) + 'px' }"></view>

		<!-- 分栏滑动核心区域 -->
		<view class="split-scroll-body" :style="{ height: bodyContentHeight }">
			<!-- 左侧纵向分类 -->
			<scroll-view scroll-y class="side-linear-menu">
				<view 
					class="menu-node" 
					v-for="(item, index) in sideCategories" 
					:key="index"
					:class="{ node_active: currentActiveNode === item }"
					@tap="currentActiveNode = item"
				>
					<text class="node-label">{{ item }}</text>
				</view>
				<view class="safe-bottom-padding"></view>
			</scroll-view>

			<!-- 右侧科普图文列表 -->
			<scroll-view scroll-y class="main-article-scroller">
				<view class="article-render-list">
					<view class="article-unit-card" v-for="(item, index) in knowledgeArticles" :key="index">
						<image :src="item.image" mode="aspectFill" class="article-unit-image"></image>
						<view class="article-unit-details">
							<view class="article-meta-top">
								<view class="badge-tag-wrap">
									<text class="badge-tag-label">{{ item.tag }}</text>
								</view>
								<text class="article-main-title">{{ item.title }}</text>
								<text class="article-sub-summary">{{ item.summary }}</text>
							</view>
							<view class="article-meta-bottom">
								<view class="view-stats-group">
									<uni-icons type="eye" size="14" color="#94a3b8"></uni-icons>
									<text class="view-count-text">{{ item.views }}</text>
								</view>
								<text class="date-stamp-text">{{ item.date }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="safe-bottom-padding"></view>
			</scroll-view>
		</view>

		<custom-tabbar currentPath="pages/knowledge/knowledge"></custom-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navHeaderHeight: 88,
				currentActiveNode: '养护技巧',
				sideCategories: [
					"养护技巧", "病虫防治", "品种介绍", "季节管理", 
					"土壤肥料", "繁殖方法", "修剪造型", "常见问题"
				],
				knowledgeArticles: [
					{
						id: 1,
						title: "兰花养护完全指南",
						tag: "养护技巧",
						summary: "从选购到日常养护，让你的兰花健康成长",
						image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						views: "2.3k",
						date: "2天前"
					},
					{
						id: 2,
						title: "多肉植物浇水的黄金法则",
						tag: "养护技巧",
						summary: "掌握浇水技巧，避免多肉烂根",
						image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						views: "5.1k",
						date: "3天前"
					},
					{
						id: 3,
						title: "春季室内植物施肥指南",
						tag: "土壤肥料",
						summary: "春天到了，给植物补充营养正当时",
						image: "https://images.unsplash.com/photo-1651807193045-1b366e7f347f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGZlcnRpbGl6ZXIlMjBwb3R8ZW58MXx8fHwxNzcwMDA0ODE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						views: "1.8k",
						date: "5天前"
					},
					{
						id: 4,
						title: "室内植物常见病虫害识别",
						tag: "病虫防治",
						summary: "及时发现问题，让植物远离病虫害",
						image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
						views: "3.2k",
						date: "1周前"
					}
				]
			};
		},
		computed: {
			bodyContentHeight() {
				return `calc(100vh - ${this.navHeaderHeight}px - 45px - 100rpx - env(safe-area-inset-bottom))`;
			}
		},
		onLoad() {
			const infoRes = uni.getSystemInfoSync();
			const statusTop = infoRes.statusBarHeight;
			// #ifdef MP-WEIXIN
			const menuBtn = uni.getMenuButtonBoundingClientRect();
			this.navHeaderHeight = statusTop + (menuBtn.top - statusTop) * 2 + menuBtn.height;
			// #endif
			// #ifndef MP-WEIXIN
			this.navHeaderHeight = statusTop + 44;
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
	.knowledge-page {
		height: 100vh;
		background-color: #f9fafb;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		.header-fixed-layout {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			background-color: #ffffff;
			z-index: 1001;

			.nav-search-container {
				flex: 1;
				display: flex;
				align-items: center;
				margin-right: 220rpx;

				.nav-search-box {
					flex: 1;
					height: 72rpx;
					background-color: #f3f4f6;
					border-radius: 36rpx;
					display: flex;
					align-items: center;
					padding-left: 24rpx;

					.nav-input-inner {
						flex: 1;
						font-size: 26rpx;
						margin-left: 12rpx;
						color: #333;
					}
				}

				.nav-grid-toggle {
					padding: 0 20rpx;
					.grid-pixel-mesh {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						gap: 4rpx;
						.pixel {
							width: 14rpx;
							height: 14rpx;
							background-color: #cbd5e1;
							border-radius: 4rpx;
						}
					}
				}
			}

			.knowledge-tabs-bar {
				height: 90rpx;
				padding: 0 30rpx;
				display: flex;
				align-items: center;
				border-bottom: 1rpx solid #f1f5f9;

				.tabs-scroll-layer {
					white-space: nowrap;
					.tab-item-chip {
						display: inline-block;
						padding: 8rpx 32rpx;
						font-size: 26rpx;
						color: #64748b;
						border-radius: 30rpx;
						margin-right: 16rpx;

						&.active {
							background-color: #f0fdf4;
							color: #16a34a;
							font-weight: 600;
							border: 1rpx solid #dcfce7;
						}
					}
					.tab-arrow-container {
						display: inline-block;
						padding-left: 10rpx;
					}
				}
			}
		}

		.split-scroll-body {
			display: flex;
			overflow: hidden;

			.side-linear-menu {
				width: 180rpx;
				height: 100%;
				background-color: #ffffff;
				border-right: 1rpx solid #f1f5f9;

				.menu-node {
					padding: 40rpx 20rpx;
					text-align: center;
					position: relative;

					.node-label {
						font-size: 24rpx;
						color: #64748b;
					}

					&.node_active {
						background-color: #f9fafb;
						.node-label {
							color: #16a34a;
							font-weight: 600;
						}
						&::before {
							content: '';
							position: absolute;
							left: 0;
							top: 30%;
							height: 40%;
							width: 8rpx;
							background-color: #16a34a;
							border-radius: 0 4rpx 4rpx 0;
						}
					}
				}
			}

			.main-article-scroller {
				flex: 1;
				height: 100%;
				padding: 24rpx;

				.article-render-list {
					.article-unit-card {
						background-color: #ffffff;
						border-radius: 24rpx;
						padding: 24rpx;
						display: flex;
						gap: 24rpx;
						margin-bottom: 24rpx;
						box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.03);

						.article-unit-image {
							width: 160rpx;
							height: 160rpx;
							border-radius: 20rpx;
							flex-shrink: 0;
						}

						.article-unit-details {
							flex: 1;
							display: flex;
							flex-direction: column;
							justify-content: space-between;

							.badge-tag-label {
								background-color: #f0fdf4;
								color: #16a34a;
								font-size: 20rpx;
								padding: 2rpx 12rpx;
								border-radius: 8rpx;
							}

							.article-main-title {
								font-size: 28rpx;
								font-weight: 700;
								color: #1e293b;
								display: block;
								margin: 8rpx 0 4rpx;
								line-height: 1.4;
							}

							.article-sub-summary {
								font-size: 22rpx;
								color: #94a3b8;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2;
								overflow: hidden;
							}

							.article-meta-bottom {
								display: flex;
								align-items: center;
								justify-content: space-between;
								margin-top: 10rpx;

								.view-stats-group {
									display: flex;
									align-items: center;
									gap: 6rpx;
									.view-count-text { font-size: 22rpx; color: #94a3b8; }
								}

								.date-stamp-text {
									font-size: 22rpx;
									color: #cbd5e1;
								}
							}
						}
					}
				}
			}
		}

		.safe-bottom-padding {
			height: 40rpx;
		}
	}
</style>
