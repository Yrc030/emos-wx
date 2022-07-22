<template>
	<view class="page">
		<view class="list">
			<view class="item" @tap="editName">
				<text class="key">姓名</text>
				<text class="value">{{ name }}</text>
			</view>
			<view class="item">
				<text class="key">性别</text>
				<picker v-if="canEdit" :value="sexIndex" :range="sexArray" @change="sexChange">{{ sexArray[sexIndex] }}</picker>
				<text v-if="!canEdit" class="value">{{ sexArray[sexIndex] }}</text>
			</view>
			<view class="item">
				<text class="key">所在部门</text>
				<picker v-if="canEdit" :value="deptIndex" :range="deptArray.map(d => d.deptName)" @change="deptChange">{{ deptArray[deptIndex].deptName }}</picker>
				<text v-if="!canEdit" class="value">{{ deptArray[deptIndex].deptName }}</text>
			</view>
			<view class="item" @tap="editTel">
				<text class="key">联系电话</text>
				<text class="value">{{ tel }}</text>
			</view>
			<view class="item" @tap="editEmail">
				<text class="key">电子信箱</text>
				<text class="value">{{ email }}</text>
			</view>
			<view class="item">
				<text class="key">入职日期</text>
				<picker v-if="canEdit" mode="date" :value="hiredate" @change="hiredateChange">
					<view class="uni-input">{{ hiredate }}</view>
				</picker>
				<text v-if="!canEdit" class="value">{{ hiredate }}</text>
			</view>
			<view class="item" @tap="selectRoles">
				<text class="key">隶属角色</text>
				<text class="value">{{ roleNames }}</text>
			</view>
			<view class="item">
				<text class="key">当前状态</text>
				<picker v-if="canEdit" :value="statusIndex" :range="statusArray" @change="statusChange">{{ statusArray[statusIndex] }}</picker>
				<text v-if="!canEdit" class="value">{{ statusArray[statusIndex] }}</text>
			</view>
		</view>
		<uni-popup ref="popupName" type="dialog">
			<uni-popup-dialog mode="input" title="编辑文字内容" :value="name" placeholder="输入姓名" @confirm="finishName"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupTel" type="dialog">
			<uni-popup-dialog mode="input" title="编辑文字内容" :value="tel" placeholder="输入电话" @confirm="finishTel"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popupEmail" type="dialog">
			<uni-popup-dialog mode="input" title="编辑文字内容" :value="email" placeholder="输入邮箱" @confirm="finishEmail"></uni-popup-dialog>
		</uni-popup>
		<view class="shadow" v-if="showRoleDialog">
			<scroll-view class="dialog" scroll-y="true">
				<view class="title">角色列表</view>
				<text class="confirm" @tap="confirm">确定</text>
				<checkbox-group @change="roleChange">
					<label class="list-item" v-if="opt != 'insert' || (opt == 'insert' && one.id != 0)" v-for="one in roleArray" :key="one.id">
						<checkbox :value="one.id" :checked="selectedRoleIds.indexOf(one.id) != -1" />
						<text>{{ one.roleName }}</text>
					</label>
				</checkbox-group>
			</scroll-view>
		</view>
		<button class="save-btn" v-if="opt != 'read' && checkPermission(['ROOT', 'EMPLOYEE:INSERT', 'EMPLOYEE:UPDATE'])" @tap="saveOrUpdate">保存</button>
		<button class="delete-btn" v-if="opt != 'read' && checkPermission(['ROOT', 'EMPLOYEE:DELETE'])" @tap="deleteUser">删除</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userId: null,
			temp: '',
			name: '',
			nickname: '',
			photo: '',
			tel: '',
			email: '',
			deptId: '',
			hiredate: '',
			roleNames: '',
			sexArray: ['男', '女'],
			sexIndex: 0,
			deptArray: [],
			deptIndex: 0,
			statusArray: ['离职', '在职'],
			statusIndex: 1,
			showRoleDialog: false,
			roleArray: [],
			selectedRoleIds: [],
			canEdit: true,
			opt: null
		};
	},
	onLoad(options) {
		if (options.hasOwnProperty('opt')) {
			this.opt = options.opt;
		}
		if (options.hasOwnProperty('userId')) {
			this.userId = options.userId;
		}
		if (this.opt == 'read') {
			this.canEdit = false;
		} else {
			//如果opt参数不是read，就检验用户是否有编辑员工信息的权限，然后给canEdit赋值
			this.canEdit = this.checkPermission(['ROOT', 'EMPLOYEE:INSERT', 'EMPLOYEE:UPDATE']);
		}
	},
	onShow() {
		this.getAllRole();
		this.getAllDept();
		if (this.opt == 'insert') {
			let now = new Date();
			let year = now.getFullYear();
			let month = now.getMonth() + 1;
			month = month < 10 ? '0' + month : month;
			let date = now.getDate();
			date = date < 10 ? '0' + date : date;
			this.hiredate = year + '-' + month + '-' + date;
			return;
		} else {
			this.getUser();
		}
	},
	methods: {
		getAllRole() {
			this.ajax(this.url.getAllRole, 'GET', null, resp => {
				this.roleArray = resp.data.result;
			});
		},
		getAllDept() {
			this.deptArray = [];
			this.ajax(this.url.getAllDept, 'GET', null, resp => {
				for (let one of resp.data.result) {
					this.deptArray.push(one);
				}
				if (this.opt == 'insert') {
					this.deptIndex = 0;
					this.deptId = this.deptArray[this.deptIndex].id;
				}
			});
		},
		getUser() {
			if (this.userId == null || this.userId < 0) {
				uni.showToast({
					title: '错误的用户ID',
					icon: 'error'
				});
				return;
			}
			let url = this.url.getUser + '?userId=' + this.userId;
			this.ajax(url, 'GET', null, resp => {
				let res = resp.data.result;
				this.name = res.name;
				this.sexIndex = this.sexArray.indexOf(res.sex);
				this.tel = res.tel;
				this.email = res.email;
				this.hiredate = res.hiredate;
				this.selectedRoleIds = JSON.parse(res.role);
				console.log(this.selectedRoleIds);
				let roleNames = [];
				for (let role of this.roleArray) {
					if (this.selectedRoleIds.includes(role.id)) {
						roleNames.push(role.roleName);
					}
				}
				this.roleNames = roleNames.join(',');
				this.deptId = res.deptId;
				for (let i = 0; i < this.deptArray.length; i++) {
					if (this.deptArray[i].deptId == this.deptId) {
						this.deptIndex = i;
						break;
					}
				}
				this.statusIndex = res.status;
			});
		},
		editName() {
			if (!this.canEdit) {
				return;
			}
			this.$refs.popupName.open();
		},
		finishName(value) {
			if (!this.checkValidName(value, '姓名')) {
				this.name = value;
			}
		},
		sexChange(e) {
			this.sexIndex = e.detail.value;
		},
		deptChange(e) {
			this.deptIndex = e.detail.value;
			this.deptId = this.deptArray[this.deptIndex].id;
		},
		editTel() {
			if (!this.canEdit) {
				return;
			}
			this.$refs.popupTel.open();
		},
		finishTel(value) {
			if (!this.checkValidTel(value, '手机号码')) {
				this.tel = value;
			}
		},
		editEmail() {
			if (!this.canEdit) {
				return;
			}
			this.$refs.popupEmail.open();
		},
		finishEmail(value) {
			if (!this.checkValidEmail(value, '邮箱')) {
				this.email = value;
			}
		},
		hiredateChange(e) {
			this.hiredate = e.detail.value;
		},
		selectRoles() {
			if (!this.canEdit) {
				return;
			}
			this.showRoleDialog = true;
		},
		roleChange(e) {
			this.selectedRoleIds = e.detail.value.map(id => Number.parseInt(id));
			console.log(this.selectedRoleIds);
			let roleNames = [];
			for (let role of this.roleArray) {
				if (this.selectedRoleIds.includes(role.id)) {
					roleNames.push(role.roleName);
				}
			}
			this.roleNames = roleNames.join(',');
		},
		statusChange(e) {
			this.statusIndex = e.detail.value;
		},
		confirm() {
			if (this.selectedRoleIds.length == 0) {
				uni.showToast({
					title: '请至少选择一个角色',
					icon: 'none'
				});
			} else {
				this.showRoleDialog = false;
			}
		},
		saveOrUpdate() {
			if (this.checkValidName(this.name, '姓名') || this.checkValidEmail(this.email, '邮箱') || this.checkValidTel(this.tel, '手机号码')) {
				return;
			}
			let self = this;
			uni.showModal({
				title: '提示信息',
				content: '是否保存用户信息？',
				success(e) {
					if (e.confirm) {
						let url = null;
						if (self.opt == 'insert') {
							url = self.url.saveUser;
						} else {
							url = self.url.updateUser;
						}
						let data = {
							id: self.userId,
							name: self.name,
							sex: self.sexArray[self.sexIndex],
							tel: self.tel,
							email: self.email,
							hiredate: self.hiredate,
							role: JSON.stringify(self.selectedRoleIds),
							deptId: self.deptId,
							status: self.statusIndex
						};
						// console.log(data);
						self.ajax(url, 'POST', data, resp => {
							uni.showToast({
								icon: resp.data.code == 200 ? 'success' : 'error',
								title: resp.data.msg,
								complete() {
									setTimeout(function() {
										uni.navigateBack({
											delta: 1
										});
									}, 2000);
								}
							});
						});
					}
				}
			});
		},
		deleteUser: function() {
			let self = this;
			uni.showModal({
				title: '提示信息',
				content: '是否删除' + self.name + '？',
				success(resp) {
					if (resp.confirm) {
						self.ajax(self.url.deleteUser, 'POST', { id: self.userId }, (resp) => {
							uni.showToast({
								icon: resp.data.code == 200 ? 'success' : 'error',
								title: resp.data.msg,
								complete() {
									setTimeout(function() {
										uni.navigateBack({
											delta: 1
										});
									}, 2000);
								}
							});
						});
					}
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('user_info.less');
</style>
