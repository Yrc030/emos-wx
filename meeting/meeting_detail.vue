<template>
	<view>
		<view class="page" v-if="checkPermission(['ROOT', 'MEETING:INSERT', 'MEETING:UPDATE'])">
			<view class="header">
				<input type="text" class="title" v-model="title" placeholder="输入会议标题" placeholder-class="title-placeholder" />
				<image src="../static/icon-18.png" mode="widthFix" class="edit-icon"></image>
			</view>
			<view class="attr">
				<view class="list">
					<view class="item">
						<view class="key">日期</view>
						<picker mode="date" :disabled="!canEdit" :value="date" @change="dateChange">
							<view class="uni-input">{{ date }}</view>
						</picker>
					</view>
					<view class="item">
						<view class="key">开始时间</view>
						<!-- <picker mode="time" :disabled="!canEdit" :value="start" :start="startOfStartTime" end="18:00" @change="startTimeChange">
							<view class="uni-input">{{ start }}</view>
						</picker> -->
						<picker mode="time" :disabled="!canEdit" :value="start"  @change="startTimeChange">
							<view class="uni-input">{{ start }}</view>
						</picker>
					</view>
					<view class="item">
						<view class="key">结束时间</view>
						<!-- <picker mode="time" :disabled="!canEdit" :value="end" :start="startOfEndTime" end="18:00" @change="endTimeChange">
							<view class="uni-input">{{ end }}</view>
						</picker> -->
						<picker mode="time" :disabled="!canEdit" :value="end"  @change="endTimeChange">
							<view class="uni-input">{{ end }}</view>
						</picker>
					</view>
					<view class="item">
						<view class="key">会议类型</view>
						<picker :value="typeIndex" :disabled="!canEdit" :range="typeArray" @change="typeChange">{{ typeArray[typeIndex] }}</picker>
					</view>
					<view class="item" v-if="typeArray[typeIndex] == '线下会议'" @tap="editPlace">
						<view class="key">地点</view>
						<view class="value">{{ place }}</view>
					</view>
				</view>
				<view @tap="editDesc">
					<text class="desc">{{ desc == '' ? '会议内容' : desc }}</text>
				</view>
			</view>
			<view class="members">
				<view class="number">参会者（{{ members.length }}人）</view>
				<view class="member">
					<view class="user" v-for="(one, index) in members" :key="index" @longpress="switchShowClear(index, one)">
						<image :src="one.photo" mode="widthFix" class="photo"></image>
						<text class="name">{{ one.name }}</text>
						<uni-icons v-show="one.showClear" class="icon" type="close" color="red" size="20" @click="deleteMember(index)"></uni-icons>
					</view>
					<view class="add" @tap="toMembersPage"><image src="../static/icon-19.png" mode="widthFix" class="add-btn" /></view>
				</view>
			</view>
			<button class="btn" @tap="saveOrUpdate">保存</button>
			<uni-popup ref="popupPlace" type="dialog">
				<uni-popup-dialog mode="input" title="编辑文字内容" :value="place" placeholder="输入会议地点" @confirm="confirmPlace" />
			</uni-popup>
			<uni-popup ref="popupDesc" type="dialog">
				<uni-popup-dialog mode="input" title="编辑文字内容" :value="desc" placeholder="输入会议内容" @confirm="confirmDesc" />
			</uni-popup>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			opt: null, // 进入当前页面的操作类型
			id: null, // 会议记录id, 如果 opt = insert, 则 id = null
			uuid: null, // uuid
			canEdit: true, // 当前会议记录是否可以编辑
			title: '', // 会议的标题
			date: '', // 会议的日期
			start: '', // 会议的开始时间
			end: '', // 会议的结束时间
			typeArray: ['在线会议', '线下会议'], // 会议的类型的可选值数据
			typeIndex: 0, // 指向 typeArray 的索引
			place: '', // 会议地点
			desc: '', // 会议描述
			members: [], // 会议成员列表
			instanceId: null // ?
		};
	},
	onLoad(options) {
		this.id = options.id;
		this.opt = options.opt;
		if (this.opt == 'edit') {
			this.getMeetingDetail(this);
		} else {
			// opt == insert
			let now = new Date();
			this.date = now.format('yyyy-MM-dd');
			this.start = now.format('hh:mm');
			now.setTime(now.getTime() + 1800000); // 30分钟的 ms 表示
			this.end = now.format('hh:mm');
		}
	},
	onShow() {
		let pages = getCurrentPages();
		let currPage = pages[pages.length - 1];
		if (currPage.hasOwnProperty('backFlag') && currPage.backFlag) {
			// from members.vue
			let ids = pages[pages.length - 1].ids;
			this.searchMembers(this, ids);
		}
	},
	methods: {
		dateChange(e) {
			this.date = e.detail.value;
		},
		startTimeChange(e) {
			this.start = e.detail.value;
		},
		endTimeChange(e) {
			this.end = e.detail.value;
		},
		typeChange(e) {
			this.typeIndex = Number(e.detail.value);
		},
		toMembersPage() {
			console.log(this.members);
			let ids = this.members.map(m => m.userId).join(',');
			uni.navigateTo({
				url: './members?ids=' + ids
			});
		},
		searchMembers(self, ids) {
			if (Array.isArray(ids) && ids.length > 0) {
				self.ajax(self.url.searchMembersByIds, 'POST', { ids }, resp => {
					//console.log(resp.data);
					if (resp.data.code == 200) {
						self.members = resp.data.result;
						for (let member of self.members) {
							member.showClear = false;
						}
						//console.log(self.members);
					} else {
						uni.showToast({
							title: resp.data.msg,
							icon: 'none'
						});
					}
				});
			}
		},
		switchShowClear(index, one) {
			one.showClear = !one.showClear;
			// 为了响应式
			this.$set(this.members, index, one);
		},
		deleteMember(index) {
			let self = this;
			// 手机震动
			uni.vibrateShort({});

			uni.showModal({
				title: '提示信息',
				content: '是否删除改名参会人员？',
				success(resp) {
					if (resp.confirm) {
						self.members.splice(index, 1);
					}
				}
			});
		},
		editPlace() {
			if (!this.canEdit) {
				return;
			}
			console.log('editPlace');
			this.$refs.popupPlace.open();
		},
		confirmPlace(value) {
			this.place = value;
			this.$refs.popupPlace.close();
		},
		editDesc() {
			if (!this.canEdit) {
				return;
			}
			console.log('editDesc');
			this.$refs.popupDesc.open();
		},
		confirmDesc(value) {
			this.desc = value;
			this.$refs.popupDesc.close();
		},
		saveOrUpdate() {
			// 表单验证
			if (
				this.checkBlank(this.title, '会议题目') ||
				this.checkValidStartAndEnd(this.start, this.end) ||
				(this.typeIndex == '1' && this.checkBlank(this.place, '会议地点')) ||
				this.checkBlank(this.desc, '会议内容') ||
				this.checkEmpty(this.members, '会议成员')
			) {
				return;
			}

			// 封装请求体
			let data = {
				id: this.id,
				uuid: this.uuid,
				title: this.title,
				date: this.date,
				start: this.start,
				end: this.end,
				type: this.typeIndex + 1,
				place: this.place,
				desc: this.desc,
				instanceId: this.instanceId,
				members: this.members.map(m => m.userId)
			};

			let url = null;
			if (this.opt == 'insert') {
				// 保存会议纪录
				url = this.url.insertMeeting;
			} else {
				// 更新会议纪录
				url = this.url.updateMeeting;
			}
			console.log(data);
			this.ajax(url, 'POST', data, function(resp) {
				if (resp.data.code == 200) {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none',
						complete() {
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								});
							}, 2000);
						}
					});
				} else {
					uni.showToast({
						title: resp.data.msg,
						icon: 'none',
						duration: 2000
					});
				}
			});
		},
		getMeetingDetail(self) {
			if (self.id != null) {
				let url = self.url.getMeetingDetailById + '?id=' + self.id;
				self.ajax(url, 'GET', null, function(resp) {
					if (resp.data.code == 200) {
						let res = resp.data.result;
						console.log(res);
						// canEdit: true, // 当前会议记录是否可以编辑
						self.uuid = res.uuid;
						self.title = res.title;
						self.date = res.date;
						self.start = res.start;
						self.end = res.end;
						self.typeIndex = res.type - 1;
						self.place = res.place;
						self.desc = res.desc;
						self.instanceId = res.instanceId;
						self.members = res.members;
					} else {
						uni.showToast({
							title: resp.data.msg,
							icon: 'none'
						});
					}
				});
			} else {
				uni.showToast({
					title: '不存在的会议',
					icon: 'none'
				});
			}
		}
	}
};
</script>

<style lang="less">
@import url('meeting_detail.less');
</style>
