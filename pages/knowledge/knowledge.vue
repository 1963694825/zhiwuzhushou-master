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
			
			<!-- 分类标签栏 -->
			<view class="knowledge-tabs-bar">
				<scroll-view scroll-x class="tabs-scroll-layer" :show-scrollbar="false">
					<view class="tab-item-chip" :class="{ active: !selectedPrimary }" @tap="resetToDefault">全部知识</view>
					<view class="tab-item-chip active" v-if="selectedPrimary">
						{{ selectedPrimary.name }}{{ selectedSecondary ? ' · ' + selectedSecondary.name : '' }}
					</view>
				</scroll-view>
				<!-- 右置筛选箭头入口 -->
				<view class="filter-trigger-icon" @tap="toggleFilterPanel">
					<uni-icons :type="isFilterPanelOpen ? 'arrowup' : 'tune'" size="20" :color="isFilterPanelOpen ? '#16a34a' : '#64748b'"></uni-icons>
				</view>
			</view>

			<!-- 展开式筛选面板 -->
			<view class="filter-expand-panel" v-if="isFilterPanelOpen">
				<view class="filter-row">
					<text class="filter-label">一级分类</text>
					<view class="filter-selector" @tap="openSelectionOverlay('primary')">
						<text class="selector-text">{{ selectedPrimary ? selectedPrimary.name : '请选择门类' }}</text>
						<uni-icons type="bottom" size="12" color="#94a3b8"></uni-icons>
					</view>
				</view>
				<view class="filter-row">
					<text class="filter-label">二级分类</text>
					<view class="filter-selector" :class="{ disabled: !selectedPrimary }" @tap="openSelectionOverlay('secondary')">
						<text class="selector-text">{{ selectedSecondary ? selectedSecondary.name : '全部品种' }}</text>
						<uni-icons type="bottom" size="12" color="#94a3b8"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 独立选择浮层 (用于弹出具体选项列表) -->
		<view class="category-selector-overlay" v-if="showCategoryOverlay" @tap="showCategoryOverlay = false">
			<view class="overlay-content-card" @tap.stop>
				<view class="overlay-header">选择{{ overlayViewMode === 'primary' ? '一级大类' : '二级品种' }}</view>
				
				<!-- 一级列表 -->
				<view class="selection-grid" v-if="overlayViewMode === 'primary'">
					<view 
						class="grid-item" 
						v-for="item in primaries" 
						:key="item.id"
						:class="{ active: selectedPrimary && selectedPrimary.id === item.id }"
						@tap="handlePrimarySelect(item)"
					>
						<text class="item-label">{{ item.name }}</text>
					</view>
				</view>

				<!-- 二级列表 -->
				<view class="selection-list" v-if="overlayViewMode === 'secondary'">
					<view class="list-item" :class="{ active: !selectedSecondary }" @tap="confirmSecondarySelect(null)">
						<text>全部品种</text>
					</view>
					<view 
						class="list-item" 
						v-for="sub in secondaries" 
						:key="sub.id"
						:class="{ active: selectedSecondary && selectedSecondary.id === sub.id }"
						@tap="confirmSecondarySelect(sub)"
					>
						<text>{{ sub.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 填充固定头部的空间 -->
		<view :style="{ height: (navHeaderHeight + 45 + (isFilterPanelOpen ? 160 : 0)) + 'px' }"></view>

		<!-- 分栏滑动核心区域 -->
		<view class="split-scroll-body" :style="{ height: bodyContentHeight }">
			<!-- 左侧侧边栏 (动态联动) -->
			<scroll-view scroll-y class="side-linear-menu">
				<view 
					class="menu-node" 
					v-for="(item, index) in sideItems" 
					:key="index"
					:class="{ node_active: activeSideIndex === index }"
					@tap="handleSideTap(index)"
				>
					<text class="node-label">{{ isSpeciesMode ? item.name : item }}</text>
				</view>
				<view class="safe-bottom-padding"></view>
			</scroll-view>

			<!-- 右侧科普图文列表 -->
			<scroll-view scroll-y class="main-article-scroller">
				<view class="article-render-list">
					<!-- 无数据提示 -->
					<view class="empty-state" v-if="knowledgeArticles.length === 0">
						<uni-icons type="info" size="40" color="#cbd5e1"></uni-icons>
						<text class="empty-text">该分类下暂无知识文章</text>
					</view>
					
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
				// 分类数据
				primaries: [],
				secondaries: [],
				selectedPrimary: null, 
				selectedSecondary: null, 
				
				// 侧边栏数据
				isSpeciesMode: false, 
				sideItems: [], 
				activeSideIndex: 0, 
				
				// 默认侧边栏分类
				defaultSideCategories: ["养护技巧", "病虫防治", "品种介绍", "季节管理", "土壤肥料", "繁殖方法", "修剪造型", "常见问题"],
				
				// 文章列表
				knowledgeArticles: [],
				
				// UI 状态
				showCategoryOverlay: false,
				isFilterPanelOpen: false,
				overlayViewMode: 'primary' // 'primary' or 'secondary'
			};
		},
		computed: {
			bodyContentHeight() {
				const extraHeader = this.isFilterPanelOpen ? 160 : 0;
				return `calc(100vh - ${this.navHeaderHeight}px - 45px - ${extraHeader}px - 100rpx - env(safe-area-inset-bottom))`;
			}
		},
		onLoad() {
			this.calculateNavHeight();
			this.initPageData();
		},
		methods: {
			calculateNavHeight() {
				const infoRes = uni.getSystemInfoSync();
				const statusTop = infoRes.statusBarHeight;
				// #ifdef MP-WEIXIN
				const menuBtn = uni.getMenuButtonBoundingClientRect();
				this.navHeaderHeight = statusTop + (menuBtn.top - statusTop) * 2 + menuBtn.height;
				// #endif
				// #ifndef MP-WEIXIN
				this.navHeaderHeight = statusTop + 44;
				// #endif
			},
			
			async initPageData() {
				// 获取一级分类列表（供筛选面板使用）
				await this.fetchPrimaries();
				
				// 默认进入“品种模式”，加载数据库中所有植物（蓝莓、树莓等）
				this.isSpeciesMode = true;
				await this.fetchSpecies(); 
			},

			async fetchPrimaries() {
				try {
					const res = await uni.request({
						url: 'http://localhost:3000/api/knowledge/primaries'
					});
					if (res.data.code === 200) {
						this.primaries = res.data.data;
					}
				} catch (e) {
					console.error('Fetch primaries fail:', e);
				}
			},

			toggleFilterPanel() {
				this.isFilterPanelOpen = !this.isFilterPanelOpen;
			},

			openSelectionOverlay(mode) {
				if (mode === 'secondary' && !this.selectedPrimary) {
					uni.showToast({ title: '请先选择一级分类', icon: 'none' });
					return;
				}
				this.overlayViewMode = mode;
				this.showCategoryOverlay = true;
			},

			async handlePrimarySelect(item) {
				this.selectedPrimary = item;
				this.selectedSecondary = null;
				this.showCategoryOverlay = false;
				
				// 预加载二级
				await this.fetchSecondaries(item.id);
				
				// 立即刷新侧边栏
				await this.applyFilters();
			},

			async fetchSecondaries(primaryId) {
				try {
					const res = await uni.request({
						url: `http://localhost:3000/api/knowledge/secondaries/${primaryId}`
					});
					if (res.data.code === 200) {
						this.secondaries = res.data.data;
					}
				} catch (e) {
					console.error('Fetch secondaries fail:', e);
				}
			},

			async confirmSecondarySelect(sub) {
				this.selectedSecondary = sub;
				this.showCategoryOverlay = false;
				await this.applyFilters();
			},

			async applyFilters() {
				this.isSpeciesMode = true;
				await this.fetchSpecies(this.selectedPrimary.id, this.selectedSecondary ? this.selectedSecondary.id : null);
			},

			async fetchSpecies(primaryId = null, secondaryId = null) {
				try {
					let url = 'http://localhost:3000/api/knowledge/species';
					const params = [];
					if (primaryId) params.push(`primary_id=${primaryId}`);
					if (secondaryId) params.push(`secondary_id=${secondaryId}`);
					if (params.length > 0) url += '?' + params.join('&');
					
					const res = await uni.request({ url });
					if (res.data.code === 200) {
						this.sideItems = res.data.data;
						this.activeSideIndex = 0;
						if (this.sideItems.length > 0) {
							this.fetchArticlesBySpecies(this.sideItems[0].id);
						} else {
							this.knowledgeArticles = [];
						}
					}
				} catch (e) {
					console.error('Fetch species fail:', e);
				}
			},

			async fetchArticlesBySpecies(speciesId) {
				if (!speciesId) return;
				try {
					const res = await uni.request({
						url: `http://localhost:3000/api/knowledge/articles/${speciesId}`
					});
					if (res.data.code === 200) {
						this.knowledgeArticles = res.data.data.map(item => ({
							id: item.id,
							title: item.title,
							tag: item.knowledge_type || '科普',
							summary: item.summary || '暂无摘要',
							image: item.cover_image || 'https://images.unsplash.com/photo-1512428559083-a40ea9013f0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
							views: '1.2k',
							date: '刚刚'
						}));
					}
				} catch (e) {
					console.error('Fetch articles fail:', e);
				}
			},

			handleSideTap(index) {
				this.activeSideIndex = index;
				if (this.isSpeciesMode) {
					const species = this.sideItems[index];
					this.fetchArticlesBySpecies(species.id);
				}
			},

			resetToDefault() {
				this.isFilterPanelOpen = false;
				this.isSpeciesMode = true; // 依然保持品种模式
				this.selectedPrimary = null;
				this.selectedSecondary = null;
				this.activeSideIndex = 0;
				this.showCategoryOverlay = false;
				// 恢复展示全品种
				this.fetchSpecies();
			}
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
			}

			.knowledge-tabs-bar {
				height: 90rpx;
				padding: 0 30rpx;
				display: flex;
				align-items: center;
				border-bottom: 1rpx solid #f1f5f9;
				position: relative;

				.tabs-scroll-layer {
					flex: 1;
					white-space: nowrap;
					margin-right: 20rpx;
					
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
				}

				.filter-trigger-icon {
					width: 80rpx;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					border-left: 1rpx solid #f1f5f9;
				}
			}

			.filter-expand-panel {
				background-color: #ffffff;
				padding: 24rpx 30rpx;
				border-bottom: 1rpx solid #f1f5f9;
				box-shadow: 0 10rpx 20rpx rgba(0,0,0,0.02);

				.filter-row {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;
					&:last-child { margin-bottom: 0; }

					.filter-label {
						width: 140rpx;
						font-size: 26rpx;
						color: #64748b;
						font-weight: 500;
					}

					.filter-selector {
						flex: 1;
						height: 72rpx;
						background-color: #f8fafc;
						border: 2rpx solid #e2e8f0;
						border-radius: 12rpx;
						padding: 0 24rpx;
						display: flex;
						align-items: center;
						justify-content: space-between;

						.selector-text {
							font-size: 26rpx;
							color: #1e293b;
							width: 0;
							flex: 1;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						&.disabled {
							opacity: 0.5;
							background-color: #f1f5f9;
						}
					}
				}
			}
		}

		.category-selector-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: rgba(0,0,0,0.4);
			z-index: 1002;
			display: flex;
			flex-direction: column;
			justify-content: center;

			.overlay-content-card {
				background-color: #ffffff;
				margin: 0 60rpx;
				border-radius: 32rpx;
				padding: 40rpx 30rpx;
				box-shadow: 0 20rpx 40rpx rgba(0,0,0,0.1);

				.overlay-header {
					font-size: 30rpx;
					font-weight: 700;
					color: #1e293b;
					margin-bottom: 40rpx;
					text-align: center;
				}

				.selection-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 20rpx;

					.grid-item {
						height: 80rpx;
						background-color: #f8fafc;
						border-radius: 16rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						border: 2rpx solid transparent;

						.item-label { font-size: 24rpx; color: #64748b; }

						&.active {
							background-color: #f0fdf4;
							border-color: #16a34a;
							.item-label { color: #16a34a; font-weight: 600; }
						}
					}
				}

				.selection-list {
					max-height: 50vh;
					overflow-y: auto;
					.list-item {
						padding: 30rpx 0;
						border-bottom: 1rpx solid #f1f5f9;
						text-align: center;
						font-size: 28rpx;
						color: #334155;

						&.active {
							color: #16a34a;
							font-weight: 600;
						}
						&:last-child { border-bottom: none; }
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
					.empty-state {
						display: flex;
						flex-direction: column;
						align-items: center;
						padding-top: 100rpx;
						.empty-text { font-size: 26rpx; color: #94a3b8; margin-top: 20rpx; }
					}

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
								line-clamp: 2;
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
