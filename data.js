(function initializeDemoData(global) {
  "use strict";

  const locations = [
    {
      id: "building-a",
      name: "1号楼",
      rooms: [
        { id: "room-a101", name: "101 大堂" },
        { id: "room-a102", name: "102 会议室" },
        { id: "room-a103", name: "103 开放办公区" },
        { id: "room-a104", name: "104 走廊" },
      ],
    },
    {
      id: "building-b",
      name: "2号楼",
      rooms: [
        { id: "room-b201", name: "201 设备间" },
        { id: "room-b202", name: "202 培训室" },
        { id: "room-b203", name: "203 办公区" },
      ],
    },
  ];

  const components = [
    { id: "cmp-001", name: "大堂主灯", remark: "入口区域", type: "照明", controlType: "switch", page: "101 大堂", roomId: "room-a101", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-002", name: "大堂筒灯", remark: "接待台", type: "照明", controlType: "cct", page: "101 大堂", roomId: "room-a101", state: "off", deviceStatus: "fault", cabinetId: "cab-001", brightness: 72, temperature: 4200 },

    { id: "cmp-101", name: "Chandelier 1", remark: "吊灯 1", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-102", name: "Chandelier 2", remark: "吊灯 2", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-103", name: "Chandelier 3", remark: "吊灯 3", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-104", name: "Chandelier 4", remark: "吊灯 4", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-001", brightness: 100 },
    { id: "cmp-105", name: "Spotlight 1", remark: "射灯 1", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-106", name: "Spotlight 2", remark: "射灯 2", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "offline", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-107", name: "Spotlight 3", remark: "射灯 3", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-108", name: "Spotlight 4", remark: "射灯 4", type: "照明", controlType: "switch", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "fault", cabinetId: "cab-002", brightness: 100 },
    { id: "cmp-109", name: "RGB1", remark: "氛围灯 1", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-002", brightness: 80, hue: 8 },
    { id: "cmp-110", name: "RGB2", remark: "氛围灯 2", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 72, hue: 18 },
    { id: "cmp-111", name: "RGB3", remark: "氛围灯 3", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 66, hue: 52 },
    { id: "cmp-112", name: "RGB4", remark: "氛围灯 4", type: "RGB 照明", controlType: "rgb", page: "102 会议室", roomId: "room-a102", state: "off", deviceStatus: "offline", cabinetId: "cab-003", brightness: 64, hue: 84 },
    { id: "cmp-113", name: "CCT Light 1", remark: "色温灯 1", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-003", brightness: 88, temperature: 5533 },
    { id: "cmp-114", name: "CCT Light 2", remark: "色温灯 2", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "fault", cabinetId: "cab-003", brightness: 82, temperature: 3000 },
    { id: "cmp-115", name: "CCT Light 3", remark: "色温灯 3", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "off", deviceStatus: "offline", cabinetId: "cab-004", brightness: 75, temperature: 3000 },
    { id: "cmp-116", name: "CCT Light 4", remark: "色温灯 4", type: "色温照明", controlType: "cct", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-004", brightness: 70, temperature: 3000 },
    { id: "cmp-117", name: "会议室空调", remark: "东侧内机", type: "空调", controlType: "hvac", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "fault", cabinetId: "cab-004", setpoint: 24, mode: "cool", fanSpeed: "medium" },
    { id: "cmp-118", name: "会议室窗帘", remark: "投影幕侧", type: "窗帘", controlType: "curtain", page: "102 会议室", roomId: "room-a102", state: "on", deviceStatus: "online", cabinetId: "cab-004", position: 65, command: "stop" },

    { id: "cmp-005", name: "办公区主灯 A", remark: "工位 1-12", type: "照明", controlType: "switch", page: "103 开放办公区", roomId: "room-a103", state: "on", deviceStatus: "online", cabinetId: "cab-004", brightness: 100 },
    { id: "cmp-006", name: "办公区主灯 B", remark: "工位 13-24", type: "色温照明", controlType: "cct", page: "103 开放办公区", roomId: "room-a103", state: "off", deviceStatus: "online", cabinetId: "cab-005", brightness: 70, temperature: 4000 },
    { id: "cmp-007", name: "办公区窗帘", remark: "南侧", type: "窗帘", controlType: "curtain", page: "103 开放办公区", roomId: "room-a103", state: "on", deviceStatus: "offline", cabinetId: "cab-005", position: 80, command: "stop" },
    { id: "cmp-008", name: "走廊灯组 1", remark: "西段", type: "照明", controlType: "switch", page: "104 走廊", roomId: "room-a104", state: "on", deviceStatus: "online", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-009", name: "走廊灯组 2", remark: "东段", type: "照明", controlType: "switch", page: "104 走廊", roomId: "room-a104", state: "off", deviceStatus: "fault", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-010", name: "设备间主灯", remark: "配电柜上方", type: "照明", controlType: "switch", page: "201 设备间", roomId: "room-b201", state: "on", deviceStatus: "online", cabinetId: "cab-005", brightness: 100 },
    { id: "cmp-011", name: "设备间排风", remark: "北墙", type: "通风", controlType: "fan", page: "201 设备间", roomId: "room-b201", state: "on", deviceStatus: "online", cabinetId: "cab-006", fanSpeed: "2" },
    { id: "cmp-012", name: "培训室灯组", remark: "讲台区", type: "色温照明", controlType: "cct", page: "202 培训室", roomId: "room-b202", state: "off", deviceStatus: "offline", cabinetId: "cab-006", brightness: 74, temperature: 4500 },
    { id: "cmp-013", name: "培训室空调", remark: "双机联控", type: "空调", controlType: "hvac", page: "202 培训室", roomId: "room-b202", state: "on", deviceStatus: "online", cabinetId: "cab-006", setpoint: 25, mode: "auto", fanSpeed: "auto" },
    { id: "cmp-014", name: "办公区灯组 C", remark: "南侧工位", type: "RGB 照明", controlType: "rgb", page: "203 办公区", roomId: "room-b203", state: "on", deviceStatus: "online", cabinetId: null, brightness: 78, hue: 62 },
    { id: "cmp-015", name: "办公区新风", remark: "回风口", type: "通风", controlType: "fan", page: "203 办公区", roomId: "room-b203", state: "off", deviceStatus: "fault", cabinetId: null, fanSpeed: "1" },
  ];

  const cabinets = [
    { id: "cab-001", name: "电箱8", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 20, updatedAt: "2026-08-26 16:36" },
    { id: "cab-002", name: "电箱7", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 31, updatedAt: "2026-08-26 16:36" },
    { id: "cab-003", name: "电箱6", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 42, updatedAt: "2026-08-26 16:36" },
    { id: "cab-004", name: "电箱5", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 53, updatedAt: "2026-08-26 16:36" },
    { id: "cab-005", name: "电箱4", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 64, updatedAt: "2026-08-26 16:36" },
    { id: "cab-006", name: "电箱3", code: "", area: "", roomId: "", status: "active", remark: "", uiLevel: 75, updatedAt: "2026-08-26 16:36" },
  ];

  const devices = [
    { id: "dev-001", remark: "0/1/145", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-001"] },
    { id: "dev-002", remark: "0/1/169", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-001"] },
    { id: "dev-003", remark: "0/1/255", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-002"] },
    { id: "dev-004", remark: "0/1/237", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-002"] },
    { id: "dev-005", remark: "0/2/25", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-003"] },
    { id: "dev-006", remark: "0/1/109", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: [] },
    { id: "dev-007", remark: "0/1/247", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-003"] },
    { id: "dev-008", remark: "0/1/243", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-004"] },
    { id: "dev-009", remark: "0/1/245", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-004"] },
    { id: "dev-010", remark: "0/2/25", type: "照明", status: "online", protocol: "KNX", model: "", product: "", address: "Heartbeat Address:0/0/0", connection: "本地", ip: "224.0.23.12", cabinetIds: ["cab-005"] },
  ];

  const history = [
    { id: "his-001", type: "设备故障", at: "2026-08-25 16:22:12", message: "[1号楼 / 102 会议室 / 1号楼会议室配电箱] 会议室空调离线", ip: "224.0.23.12", cabinetId: "cab-001" },
    { id: "his-002", type: "应用操作", at: "2026-08-25 16:21:48", message: "admin 控制大堂主灯：打开" },
    { id: "his-003", type: "设备故障", at: "2026-08-25 16:18:05", message: "[1号楼 / 104 走廊 / 1号楼公共区域应急照明配电箱（东区）] 走廊灯组2通信超时", ip: "224.0.23.16", cabinetId: "cab-002" },
    { id: "his-004", type: "应用操作", at: "2026-08-25 16:12:28", message: "admin 编辑组件：办公区主灯 A" },
    { id: "his-005", type: "系统操作", at: "2026-08-25 15:46:17", message: "外部平台同步设备“大堂主照明”的配电箱关联" },
    { id: "his-006", type: "设备故障", at: "2026-08-25 15:38:40", message: "[2号楼 / 203 办公区 / 2号楼办公区配电箱] 办公区新风滤网寿命预警", ip: "224.0.23.15", cabinetId: "cab-003" },
    { id: "his-007", type: "应用操作", at: "2026-08-25 15:22:03", message: "admin 控制培训室灯组：关闭" },
    { id: "his-008", type: "系统操作", at: "2026-08-25 15:18:09", message: "外部平台同步配电箱资料：1号楼一层照明配电箱" },
    { id: "his-009", type: "设备故障", at: "2026-08-25 14:57:22", message: "室外景观灯离线", ip: "224.0.23.18" },
    { id: "his-010", type: "应用操作", at: "2026-08-25 14:31:18", message: "admin 修改设备监测状态" },
    { id: "his-011", type: "设备故障", at: "2026-08-25 13:26:51", message: "[2号楼 / 201 设备间 / 2号楼设备间配电箱] 设备间排风反馈异常", ip: "224.0.23.17", cabinetId: "cab-004" },
    { id: "his-012", type: "系统操作", at: "2026-08-25 12:12:43", message: "外部平台同步新增配电箱：1号楼备用配电箱" },
    { id: "his-013", type: "应用操作", at: "2026-08-25 11:44:08", message: "admin 控制办公区窗帘：打开" },
    { id: "his-014", type: "设备故障", at: "2026-08-25 11:03:37", message: "[1号楼 / 101 大堂 / 1号楼一层照明配电箱] 门厅照度传感器数据超限", ip: "224.0.23.19", cabinetId: "cab-005" },
    { id: "his-015", type: "应用操作", at: "2026-08-25 10:48:26", message: "admin 控制会议室灯带：打开" },
    { id: "his-016", type: "系统操作", at: "2026-08-25 10:16:11", message: "外部平台同步配电箱状态：2号楼培训室配电箱已停用" },
    { id: "his-017", type: "设备故障", at: "2026-08-24 18:42:09", message: "[1号楼 / 103 开放办公区 / 1号楼办公区照明配电箱] 办公区灯组A回路故障", ip: "224.0.23.14", cabinetId: "cab-004" },
    { id: "his-018", type: "应用操作", at: "2026-08-24 17:40:22", message: "admin 控制走廊灯组1：打开" },
    { id: "his-019", type: "设备故障", at: "2026-08-24 16:12:05", message: "[1号楼 / 102 会议室 / 1号楼会议室配电箱] 会议室空调温控器离线", ip: "224.0.23.13", cabinetId: "cab-001" },
    { id: "his-020", type: "系统操作", at: "2026-08-24 15:33:48", message: "admin 修改设备 IP" },
    { id: "his-021", type: "应用操作", at: "2026-08-24 14:51:39", message: "admin 编辑组件：培训室空调" },
    { id: "his-022", type: "设备故障", at: "2026-08-24 13:27:16", message: "[2号楼 / 203 办公区 / 2号楼办公区配电箱] 办公区灯组C回路过载", ip: "224.0.23.15", cabinetId: "cab-003" },
    { id: "his-023", type: "应用操作", at: "2026-08-24 11:10:04", message: "admin 控制大堂筒灯：关闭" },
    { id: "his-024", type: "系统操作", at: "2026-08-24 09:36:55", message: "外部平台同步解除设备与配电箱关联" },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  global.GVP_DEMO_DATA = {
    create() {
      return {
        locations: clone(locations),
        components: clone(components),
        cabinets: clone(cabinets),
        devices: clone(devices),
        history: clone(history),
      };
    },
  };
})(window);
