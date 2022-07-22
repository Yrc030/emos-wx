import Vue from 'vue'
import App from './App'


Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()



// 定义全局的请求路径
 let baseUrl = "https://yrc.life/emos-wx-api"
//let baseUrl = "http://192.168.10.3:8080/emos-wx-api"
Vue.prototype.tencent = {
	trtc: {
		appid: "1400702946"
	}
}
Vue.prototype.url = {
	// 用户注册
	register: baseUrl + "/user/register/",
	// 用户登录
	login: baseUrl + "/user/login/",
	// 查询是否可以签到
	canCheckin: baseUrl + "/checkin/canCheckin/",
	// 签到
	checkin: baseUrl + "/checkin/checkin/",
	// 创建人脸模型数据
	createFaceModel: baseUrl + "/faceModel/createFaceModel/",
	// 签到结果
	getUserCheckin: baseUrl + "/checkin/getUserCheckin",
	// 获取用户简要信息
	getUserSummary: baseUrl + "/user/getUserSummary",
	// 获取用户月签到信息
	getMonthCheckin: baseUrl + "/checkin/getMonthCheckin",
	// 刷新用户信息
	refreshMessage: baseUrl + "/message/refreshMessage",
	// 消息列表分页查询
	messagePage: baseUrl + "/message/page",
	// 将消息更新为已读
	updateToRead: baseUrl + "/message/updateToRead/",
	// 删除消息
	deleteMsg: baseUrl + "/message/deleteRef/",
	// 会议日期分组分页查询
	groupPageByDate: baseUrl + "/meeting/groupPageByDate",
	// 会议记录分页查询
	meetingPage: baseUrl + "/meeting/meetingPage",
	// 保存会议纪录
	insertMeeting: baseUrl + "/meeting/insertMeeting",
	// 检索成员
	searchMembersByKeyword: baseUrl + "/user/searchMembersByKeyword",
	// 获取成员信息
	searchMembersByIds: baseUrl + "/user/searchMembersByIds",
	// 获取会议详情
	getMeetingDetailById: baseUrl + '/meeting/getMeetingDetailById',
	// 更新会议记录
	updateMeeting: baseUrl + "/meeting/updateMeeting",
	// 删除会议纪录
	deleteMeetingById: baseUrl + "/meeting/deleteMeetingById",
	// 搜索工作流实例列表
	searchUserTaskListByPage: baseUrl +  "/approval/searchUserTaskListByPage",
	// 会议审批
	approvalMeeting: baseUrl + '/approval/approveTask',
	// 查询用户（终审人）的用户名和头像
	getUsernameAndPhoto: baseUrl + '/user/getUsernameAndPhoto',
	// 生成用户签名（视频会议 TRTC）
	genUserSig: baseUrl + "/user/genUserSig",
	// 获取 roomId
	getRoomIdByUUID: baseUrl + "/meeting/getRoomIdByUUID",
	// 获取用户在指定月份内有会议的日期
	getUserMeetingDatesInMonth: baseUrl + "/meeting/getUserMeetingDatesInMonth",
	// 分页获取用户指定日期（年月）内的会议列表
	meetingPageByUserIdAndDate: baseUrl + "/meeting/meetingPageByUserIdAndDate",
	// 获取角色拥有的权限
	getRoleOwnPermission: baseUrl + "/role/getRoleOwnPermission",
	// 获取所有的权限
	getAllPermission: baseUrl + "/role/getAllPermission",
	// 获取所有角色
	getAllRole: baseUrl + "/role/getAllRole",
	// 新增角色
	saveRole: baseUrl + "/role/saveRole",
	// 更新角色
	updateRole: baseUrl + "/role/updateRole",
	// 删除角色
	deleteRoleById: baseUrl + "/role/deleteRoleById",
	// 获取所有部门
	getAllDept: baseUrl + "/dept/getAllDept",
	// 新增部门
	saveDept: baseUrl + "/dept/saveDept",
	// 修改部门
	updateDept: baseUrl + "/dept/updateDept",
	// 删除部门
	deleteDept: baseUrl + "/dept/deleteDept",
	// 获取用户信息
	getUser: baseUrl + "/user/getUser",
	// 保存用户
	saveUser: baseUrl + "/user/saveUser",
	// 修改用户
	updateUser: baseUrl + "/user/updateUser",
	// 删除用户
	deleteUser: baseUrl + "/user/deleteUser",
	// 获取联系人列表
	getContactList: baseUrl + "/user/getContactList"
}


// 定义全局的 ajax 请求
Vue.prototype.ajax = function(url, method, data, callback) {
	uni.request({
		"url": url,
		"method": method,
		"header": {
			// 获取本地 Storage 中保存的 token 
			// 解释：当用户的登录，注册等请求从后端返回了 token 后，会保存在浏览器 Storage 中，
			// 所以每次请求我们都需要从 Storage 中尝试取出 token（可能不存在），并作为
			// 请求头提交给后端进行验证。
			token: uni.getStorageSync("token")
		},
		"data": data,
		success: function(resp) {
			// 请求成功后
			if (resp.statusCode == 401) {
				// Http响应码为401表示未登录，则重定向到登录页面
				uni.redirectTo({
					url: "/pages/login/login.vue"
				})
			} else if (resp.statusCode == 200 && resp.data.code == 200) {
				// Http响应码为200 并且 响应体中的 code 也为 200，说明请求成功
				// 判断响应中是否有 token 字符串，
				if (resp.data.hasOwnProperty("token")) {
					console.log(resp.data.token);
					// 如果有则保存(或更新)到 Storage 中
					uni.setStorageSync("token", resp.data.token)
				}
				// 调用回调函数
				callback(resp)
			} else {
				// 其它响应码，则输出错误信息
				uni.showToast({
					icon: "none",
					title: resp.data,
					duration: 3000
				})
			}
		}
	})
}



// Vue.prototype.checkPermission = function(perms) {
// 	let permission = uni.getStorageSync("permission")
// 	let result = false;
// 	for (let one of perms) {
// 		if (permission.indexOf(one) != -1) {
// 			result = true;
// 			break;
// 		}
// 	}
// 	return result;
// }
// 定义全局权限验证
Vue.prototype.checkPermission = function(perms) {
	let permission = uni.getStorageSync('permission');
	for (let p of perms) {
		if (permission.includes(p)) {
			return true;
		}
	}
	return false;
}


// 为 Date 对象添加 format 方法
Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k])
				.length)));
		}
	}
	return fmt;
}


// 前端验证函数
Vue.prototype.checkNull = function(data, name) {
	if (data == null) {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	}
	return false
}
Vue.prototype.checkBlank = function(data, name) {
	if (data == null || data == "") {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	}
	return false
}

Vue.prototype.checkValidName = function(data, name) {
	if (data == null || data == "") {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	} else if (!/^[\u4e00-\u9fa5]{2,15}$/.test(data)) {
		uni.showToast({
			icon: "none",
			title: name + "内容不正确"
		})
		return true
	}
	return false
}

Vue.prototype.checkValidTel = function(data, name) {
	if (data == null || data == "") {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	} else if (!/^1[0-9]{10}$/.test(data)) {
		uni.showToast({
			icon: "none",
			title: name + "内容不正确"
		})
		return true
	}
	return false
}

Vue.prototype.checkValidEmail = function(data, name) {
	if (data == null || data == "") {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	} else if (!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(data)) {
		uni.showToast({
			icon: "none",
			title: name + "内容不正确"
		})
		return true
	}
	return false
}

Vue.prototype.checkValidStartAndEnd = function(start, end) {
	let d1 = new Date("2000/01/01 " + start + ":00");
	let d2 = new Date("2000/01/01 " + end + ":00");
	if (d2.getTime() <= d1.getTime()) {
		uni.showToast({
			icon: "none",
			title: "结束时间必须大于开始时间"
		})
		return true
	}
	return false
}

Vue.prototype.checkEmpty = function(array, name) {
	if(array == null || !Array.isArray(array) || array.length == 0) {
		uni.showToast({
			icon: "none",
			title: name + "不能为空"
		})
		return true
	}
	return false;
}
