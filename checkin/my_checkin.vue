<template>
	<view>
		<view class="statistics">
			<image src="../static/big-icon-1.png" mode="widthFix" class="big-icon"></image>
			<view class="report-title">
				<text class="days">{{ checkinDays }}</text>
				<text class="unit">天</text>
			</view>
			<view class="sub-title"><text>{{ month }}月签到</text></view>
			<view class="report">
				<view class="column green">
					<text class="column-title">正常签到</text>
					<text class="number">{{ normalDays }}</text>
				</view>
				<view class="column orange">
					<text class="column-title">迟到签到</text>
					<text class="number">{{ lateDays }}</text>
				</view>
				<view class="column red">
					<text class="column-title">缺勤签到</text>
					<text class="number">{{ absenceDays }}</text>
				</view>
			</view>
		</view>
		<view class="calendar-container">
			<uni-calendar 
				:insert="true" 
				:lunar="true" 
				:selected="monthCheckinStatus" 
				@monthSwitch="changeMonth" 
				@confirm="changeMonth" 
				@change="changeMonth"
				/>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return { 
			hiredate: '',
			month: 0,
			checkinDays: 0,
			normalDays: 0, 
			lateDays: 0, 
			absenceDays: 0,
			monthCheckinStatus: [],
		};
	},
	onShow() {
		let day = new Date();
		let year = day.getFullYear();
		let month = day.getMonth()  + 1;
		this.getCheckin(this, year, month);
	},
	methods: {
		changeMonth(e) {
			this.getCheckin(this, e.year, e.month);
		},
		getCheckin(vm, year, month) {
			// 初始化模型数据
			vm.monthCheckinStatus = [];
			vm.month = month;
			vm.checkinDays = 0;
			vm.normalDays = 0;
			vm.lateDays = 0;
			vm.absenceDays = 0;
			// 发送查询请求
			let url = vm.url.getMonthCheckin + "/" + year + "/" + month;
			vm.ajax(url, 'GET', null, function(resp) {
				let code = resp.data.code;
				if(code == 200) {
					let res = resp.data.result;
					vm.checkinDays = res.checkinDays;
					vm.normalDays = res.normalDays;
					vm.lateDays = res.lateDays;
					vm.absenceDays = res.absenceDays;
					for(let one of res.monthCheckinStatus) {
						if(one.status == null || one.status == '') {
							continue;
						}
						// 有考勤状态的日期才会被点亮
						let color = '';
						if(one.status == '正常') {
							color = 'green';
						} else if(one.status == '迟到') {
							color = 'orange';
						} else if(one.status == '缺勤') {
							color = 'red';
						}
						vm.monthCheckinStatus.push({
							date: one.date,
							info: one.status,
							color: color,
						})
					}
				}
			})
		}
	}
};
</script>

<style lang="less">
@import url('my_checkin.less');
</style>
