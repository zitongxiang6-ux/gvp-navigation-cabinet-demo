(function bootstrapGvpDemo() {
  "use strict";

  const app = document.getElementById("app");
  const pageTitle = document.getElementById("pageTitle");
  const modalRoot = document.getElementById("modalRoot");
  const toastStack = document.getElementById("toastStack");

  if (!app || !pageTitle || !modalRoot || !toastStack || !window.GVP_DEMO_DATA) {
    throw new Error("Demo 初始化失败：页面节点或 Mock 数据缺失");
  }

  let model = window.GVP_DEMO_DATA.create();

  const state = {
    page: getPageFromHash(),
    overview: {
      selectedMonth: "2026-10",
      trendRange: "12m",
    },
    navigation: {
      selectedLocation: "room-a102",
      editorComponentId: null,
    },
    cabinetFunctions: {
      selectedAreaId: "all",
      selectedCabinetId: "cab-001",
      expandedAreaIds: new Set(["all", ...model.locations.map((building) => building.id)]),
      filterField: "remark",
      filterValue: "",
      page: 1,
      pageSize: 10,
      selected: new Set(),
    },
    devices: {
      filterField: "remark",
      appliedKeyword: "",
      appliedType: "all",
      appliedCabinet: "all",
      page: 1,
      pageSize: 10,
      selected: new Set(),
    },
    history: {
      appliedType: "all",
      appliedDate: "all",
      page: 1,
      pageSize: 10,
    },
    energyClassification: {
      deviceRemark: "",
      deviceType: "all",
      protocol: "all",
      deviceModel: "",
      mode: "all",
      functionName: "",
      usageType: "all",
      statisticsArea: "all",
      dataStatus: "all",
      abnormalOnly: false,
      sortKey: null,
      sortDirection: "asc",
      page: 1,
      pageSize: 10,
      addStep: 1,
      draft: null,
      editDraft: null,
      detailRange: "30d",
    },
    energyAssignment: {
      filterArea: "all",
      deviceRemark: "",
      usageType: "all",
      page: 1,
      pageSize: 10,
      selected: new Set(),
      assignmentDraft: null,
    },
  };

  let cabinetFunctionFilterTimer = null;
  let deviceFilterTimer = null;
  let energyFilterTimer = null;
  let energyAssignmentFilterTimer = null;

  const pageNames = {
    overview: "首页",
    navigation: "导航",
    "cabinet-functions": "配电箱设备查询",
    history: "历史记录",
    devices: "设备管理",
    "energy-classification": "能源统计分类",
    "energy-assignment": "能源分类分配（简化版）",
  };

  function getPageFromHash() {
    const value = window.location.hash.replace(/^#/, "");
    if (["cabinet-devices", "device-functions"].includes(value)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#cabinet-functions`);
      return "cabinet-functions";
    }
    const validPages = ["overview", "navigation", "cabinet-functions", "history", "devices", "energy-classification", "energy-assignment"];
    return validPages.includes(value) ? value : "overview";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    return `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  }

  function roomAreaOptions(selectedId, includeAll = true) {
    const options = [];
    if (includeAll) options.push(`<option value="all"${selectedId === "all" ? " selected" : ""}>全部区域</option>`);
    for (const building of model.locations) {
      options.push(`<optgroup label="${escapeHtml(building.name)}">`);
      for (const room of building.rooms) {
        options.push(
          `<option value="${escapeHtml(room.id)}"${selectedId === room.id ? " selected" : ""}>${escapeHtml(building.name)} / ${escapeHtml(room.name)}</option>`,
        );
      }
      options.push("</optgroup>");
    }
    return options.join("");
  }

  function getComponent(id) {
    return model.components.find((item) => item.id === id) ?? null;
  }

  function componentControlLabel(controlType) {
    const labels = {
      switch: "开关照明",
      rgb: "RGB 调光",
      cct: "色温调光",
      hvac: "空调控制",
      curtain: "窗帘控制",
      fan: "通风控制",
    };
    return labels[controlType] ?? "组件控制";
  }

  function componentPowerButton(component, context) {
    return `
      <button class="component-power${component.state === "on" ? " on" : ""}" type="button" data-action="toggle-component-power" data-id="${component.id}" data-context="${context}" aria-label="${component.state === "on" ? "关闭" : "开启"} ${escapeHtml(component.name)}">
        ${icon("power")}
      </button>`;
  }

  function renderSimpleSwitch(component) {
    return `
      <article class="simple-component${component.state === "off" ? " off" : ""}">
        <button class="component-config" type="button" data-action="edit-component" data-id="${component.id}" aria-label="编辑 ${escapeHtml(component.name)}">✿</button>
        <button class="simple-component-control" type="button" data-action="toggle-component-power" data-id="${component.id}" data-context="canvas" aria-label="${component.state === "on" ? "关闭" : "开启"} ${escapeHtml(component.name)}">
          <span class="simple-component-dot"></span>
          <span>${escapeHtml(component.name)}</span>
        </button>
      </article>`;
  }

  function renderControlWidget(component, context = "canvas") {
    const isModal = context === "modal";
    const isEditor = context === "editor";
    const heading = `
      <header class="control-widget-header">
        <div><strong>${escapeHtml(component.name)}</strong><span>${escapeHtml(componentControlLabel(component.controlType))}</span></div>
        ${isModal ? "" : isEditor ? `<span class="component-config editor-preview-config" aria-hidden="true">✿</span>` : `<button class="component-config" type="button" data-action="edit-component" data-id="${component.id}" aria-label="编辑 ${escapeHtml(component.name)}">✿</button>`}
      </header>`;
    let controls = "";

    if (component.controlType === "switch") {
      controls = `
        <div class="switch-control-panel">
          <div class="switch-control-status"><span class="status-light"></span><strong>${component.state === "on" ? "已开启" : "已关闭"}</strong><small>当前为开关控制组件</small></div>
          <div class="command-buttons two-columns">
            <button class="command-button${component.state === "on" ? " active" : ""}" type="button" data-action="set-component-power" data-id="${component.id}" data-value="on" data-context="${context}">开启</button>
            <button class="command-button${component.state === "off" ? " active" : ""}" type="button" data-action="set-component-power" data-id="${component.id}" data-value="off" data-context="${context}">关闭</button>
          </div>
        </div>`;
    }

    if (component.controlType === "rgb") {
      controls = `
        <div class="component-control-row">
          <span class="control-row-label">颜色</span>
          <input class="component-range rgb-range" type="range" min="0" max="100" value="${component.hue}" data-control="hue" data-id="${component.id}" aria-label="RGB 色相">
          <output data-control-output="hue" data-id="${component.id}">${component.hue}%</output>
        </div>
        <div class="component-control-row${isModal ? "" : " compact-only"}">
          <span class="control-row-label">亮度</span>
          <input class="component-range brightness-range" type="range" min="0" max="100" value="${component.brightness}" data-control="brightness" data-id="${component.id}" aria-label="亮度">
          <output data-control-output="brightness" data-id="${component.id}">${component.brightness}%</output>
        </div>`;
    }

    if (component.controlType === "cct") {
      controls = `
        <div class="component-control-row">
          <span class="control-row-label">色温</span>
          <input class="component-range cct-range" type="range" min="2700" max="6500" step="100" value="${component.temperature}" data-control="temperature" data-id="${component.id}" aria-label="色温">
          <output data-control-output="temperature" data-id="${component.id}">${component.temperature}K</output>
        </div>
        <div class="component-control-row${isModal ? "" : " compact-only"}">
          <span class="control-row-label">亮度</span>
          <input class="component-range brightness-range" type="range" min="0" max="100" value="${component.brightness}" data-control="brightness" data-id="${component.id}" aria-label="亮度">
          <output data-control-output="brightness" data-id="${component.id}">${component.brightness}%</output>
        </div>`;
    }

    if (component.controlType === "hvac") {
      const modes = [["auto", "自动"], ["cool", "制冷"], ["heat", "制热"], ["fan", "送风"]];
      const speeds = [["auto", "自动"], ["low", "低速"], ["medium", "中速"], ["high", "高速"]];
      controls = `
        <div class="temperature-stepper">
          <button type="button" data-action="adjust-setpoint" data-id="${component.id}" data-delta="-1" data-context="${context}">−</button>
          <div><strong data-control-output="setpoint" data-id="${component.id}">${component.setpoint}℃</strong><span>设定温度</span></div>
          <button type="button" data-action="adjust-setpoint" data-id="${component.id}" data-delta="1" data-context="${context}">＋</button>
        </div>
        <div class="control-option-group"><span>运行模式</span><div>${modes.map(([value, label]) => `<button class="option-button${component.mode === value ? " active" : ""}" type="button" data-action="set-component-mode" data-id="${component.id}" data-value="${value}" data-context="${context}">${label}</button>`).join("")}</div></div>
        <div class="control-option-group"><span>风速</span><div>${speeds.map(([value, label]) => `<button class="option-button${component.fanSpeed === value ? " active" : ""}" type="button" data-action="set-component-fan" data-id="${component.id}" data-value="${value}" data-context="${context}">${label}</button>`).join("")}</div></div>`;
    }

    if (component.controlType === "curtain") {
      controls = `
        <div class="curtain-visual"><span style="height:${Math.max(15, 100 - component.position)}%"></span><strong data-control-output="position" data-id="${component.id}">${component.position}%</strong></div>
        <div class="component-control-row">
          <span class="control-row-label">开合度</span>
          <input class="component-range curtain-range" type="range" min="0" max="100" value="${component.position}" data-control="position" data-id="${component.id}" aria-label="窗帘开合度">
          <output data-control-output="position" data-id="${component.id}">${component.position}%</output>
        </div>
        <div class="command-buttons three-columns">
          ${[["open", "打开"], ["stop", "停止"], ["close", "关闭"]].map(([value, label]) => `<button class="command-button${component.command === value ? " active" : ""}" type="button" data-action="set-curtain-command" data-id="${component.id}" data-value="${value}" data-context="${context}">${label}</button>`).join("")}
        </div>`;
    }

    if (component.controlType === "fan") {
      controls = `
        <div class="fan-visual${component.state === "on" ? " spinning" : ""}"><span>✣</span><strong>${component.state === "on" ? `运行 · ${component.fanSpeed} 档` : "已停止"}</strong></div>
        <div class="control-option-group"><span>风速档位</span><div>${["1", "2", "3"].map((value) => `<button class="option-button${component.fanSpeed === value ? " active" : ""}" type="button" data-action="set-fan-level" data-id="${component.id}" data-value="${value}" data-context="${context}">${value} 档</button>`).join("")}</div></div>`;
    }

    const power = component.controlType === "switch" || component.controlType === "curtain" ? "" : componentPowerButton(component, context);
    return `
      <article class="control-widget control-${component.controlType}${component.state === "off" ? " off" : ""}${isModal ? " modal-control-widget" : ""}">
        ${heading}
        <div class="control-widget-body">${controls}</div>
        ${power}
      </article>`;
  }

  function deviceTypes() {
    return [...new Set(model.devices.map((item) => item.type))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  }

  function getCabinet(id) {
    return model.cabinets.find((item) => item.id === id) ?? null;
  }

  function displayCabinet(device) {
    if (!device || device.cabinetIds.length !== 1) return null;
    const cabinet = getCabinet(device.cabinetIds[0]);
    return cabinet?.status === "active" ? cabinet : null;
  }

  function cabinetColorText(name, cabinet) {
    const text = escapeHtml(name ?? "");
    if (!text || !cabinet) return text;
    return `<span class="cabinet-color-text" style="--cabinet-color:${cabinetUiColor(cabinet)}">${text}</span>`;
  }

  function pagerHtml(total, page, pageSize, scope) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const pages = [];
    const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    const end = Math.min(totalPages, Math.max(5, safePage + 2));
    for (let index = start; index <= end; index += 1) {
      pages.push(
        `<button class="page-button${index === safePage ? " active" : ""}" type="button" data-action="paginate" data-scope="${scope}" data-page-num="${index}">${index}</button>`,
      );
    }
    return `
      <div class="pagination-bar" aria-label="分页">
        <button class="page-button" type="button" data-action="paginate" data-scope="${scope}" data-page-num="${safePage - 1}"${safePage <= 1 ? " disabled" : ""}>‹</button>
        ${pages.join("")}
        <button class="page-button" type="button" data-action="paginate" data-scope="${scope}" data-page-num="${safePage + 1}"${safePage >= totalPages ? " disabled" : ""}>›</button>
        <select class="page-size" aria-label="每页条数" data-action="page-size" data-scope="${scope}">
          ${[8, 10, 20].map((size) => `<option value="${size}"${pageSize === size ? " selected" : ""}>${size} 条/页</option>`).join("")}
        </select>
      </div>`;
  }

  function render() {
    state.page = getPageFromHash();
    if (state.page !== "navigation") state.navigation.editorComponentId = null;
    document.body.classList.toggle("overview-mode", state.page === "overview");
    pageTitle.textContent = pageNames[state.page] ?? "GVP";
    document.querySelectorAll(".side-nav-item[data-page]").forEach((item) => {
      const target = item.dataset.page;
      item.classList.toggle("active", target === state.page);
    });

    switch (state.page) {
      case "overview":
        app.innerHTML = renderOverviewPage();
        break;
      case "navigation":
        app.innerHTML = state.navigation.editorComponentId ? renderComponentEditorPage() : renderNavigationPage();
        break;
      case "cabinet-functions":
        app.innerHTML = renderCabinetFunctionQueryPage();
        break;
      case "devices":
        app.innerHTML = renderDevicePage();
        break;
      case "history":
        app.innerHTML = renderHistoryPage();
        break;
      case "energy-classification":
        app.innerHTML = renderEnergyClassificationPage();
        break;
      case "energy-assignment":
        app.innerHTML = renderEnergyAssignmentPage();
        break;
      default:
        app.innerHTML = renderPlaceholderPage(state.page);
        break;
    }
    app.querySelectorAll('input[data-indeterminate="true"]').forEach((input) => {
      input.indeterminate = true;
    });
    app.focus({ preventScroll: true });
  }

  function formatEnergy(value) {
    return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);
  }

  function formatRate(value) {
    if (!Number.isFinite(value)) return "--";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  function percentChange(current, previous) {
    return previous ? ((current - previous) / previous) * 100 : Number.NaN;
  }

  function monthDisplay(month) {
    const [year, value] = month.split("-");
    return `${year}.${value}`;
  }

  const overviewTrendRangeLabels = { "7d": "近7天", "30d": "近30天", "12m": "近12月" };

  function overviewDailyTrend(monthRecord) {
    const [year, month] = monthRecord.month.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const weights = Array.from({ length: daysInMonth }, (_, index) => {
      const weekdayFactor = [0.86, 0.93, 1.02, 1.08, 1.04, 1.12, 0.95][index % 7];
      return weekdayFactor + Math.sin((index + 1) * 1.17) * 0.045;
    });
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const lightingRatio = monthRecord.lighting / monthRecord.total;
    const socketRatio = monthRecord.socket / monthRecord.total;
    return weights.map((weight, index) => {
      const total = (monthRecord.total * weight) / totalWeight;
      const day = index + 1;
      return {
        period: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        label: `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`,
        total,
        lighting: total * lightingRatio,
        socket: total * socketRatio,
        hvac: total * (1 - lightingRatio - socketRatio),
      };
    });
  }

  function overviewEnergyContext() {
    const records = model.energyRecords;
    const selectedIndex = Math.max(0, records.findIndex((record) => record.month === state.overview.selectedMonth));
    const current = records[selectedIndex];
    const previous = records[selectedIndex - 1];
    const priorYear = records[selectedIndex - 12];
    const year = current.month.slice(0, 4);
    const annualRecords = records.filter((record) => record.month.startsWith(`${year}-`) && record.month <= current.month);
    const annual = annualRecords.reduce(
      (totals, record) => ({
        total: totals.total + record.total,
        lighting: totals.lighting + record.lighting,
        socket: totals.socket + record.socket,
        hvac: totals.hvac + record.hvac,
      }),
      { total: 0, lighting: 0, socket: 0, hvac: 0 },
    );
    const monthlyTrend = records.slice(Math.max(0, selectedIndex - 11), selectedIndex + 1).map((record) => ({
      ...record,
      period: record.month,
      label: monthDisplay(record.month),
    }));
    const dailyTrend = overviewDailyTrend(current);
    const trendRange = state.overview.trendRange ?? "12m";
    const trend = trendRange === "7d" ? dailyTrend.slice(-7) : trendRange === "30d" ? dailyTrend.slice(-30) : monthlyTrend;
    return {
      current,
      annual,
      trend,
      trendRange,
      monthOnMonth: percentChange(current.total, previous?.total),
      yearOnYear: percentChange(current.total, priorYear?.total),
    };
  }

  function overviewSummaryRows(values) {
    return `
      <div class="overview-energy-total"><strong>${formatEnergy(values.total)}</strong><span>kWh</span></div>
      <dl class="overview-energy-breakdown">
        <div><dt><i class="energy-key lighting"></i>照明用电量</dt><dd>${formatEnergy(values.lighting)} <span>kWh</span></dd></div>
        <div><dt><i class="energy-key socket"></i>插排用电量</dt><dd>${formatEnergy(values.socket)} <span>kWh</span></dd></div>
        <div><dt><i class="energy-key hvac"></i>空调用电量</dt><dd>${formatEnergy(values.hvac)} <span>kWh</span></dd></div>
      </dl>`;
  }

  function energyTrendChart(records, range) {
    const width = 1120;
    const height = 310;
    const plot = { left: 66, right: 24, top: 22, bottom: 52 };
    const plotWidth = width - plot.left - plot.right;
    const plotHeight = height - plot.top - plot.bottom;
    const rawMaxValue = Math.max(...records.map((record) => record.total));
    const gridStep = rawMaxValue <= 1000 ? Math.max(50, Math.ceil(rawMaxValue / 200) * 50) : Math.max(1000, Math.ceil(rawMaxValue / 4000) * 1000);
    const maxValue = gridStep * 4;
    const x = (index) => plot.left + (records.length <= 1 ? 0 : (index * plotWidth) / (records.length - 1));
    const y = (value) => plot.top + plotHeight - (value / maxValue) * plotHeight;
    const dimensions = [
      ["total", "总用电量", "#2f3448"],
      ["lighting", "照明用电量", "#2f92f3"],
      ["hvac", "空调用电量", "#f06b72"],
      ["socket", "插排用电量", "#78b73c"],
    ];
    const grid = Array.from({ length: 5 }, (_, index) => {
      const value = (maxValue * (4 - index)) / 4;
      const pointY = plot.top + (index * plotHeight) / 4;
      return `<g><line x1="${plot.left}" y1="${pointY}" x2="${width - plot.right}" y2="${pointY}" class="energy-grid-line"/><text x="${plot.left - 14}" y="${pointY + 4}" text-anchor="end" class="energy-axis-label">${formatEnergy(value)}</text></g>`;
    }).join("");
    const lines = dimensions
      .map(([key, label, color]) => {
        const points = records.map((record, index) => `${x(index).toFixed(1)},${y(record[key]).toFixed(1)}`).join(" ");
        const markers = records
          .map((record, index) => `<circle cx="${x(index).toFixed(1)}" cy="${y(record[key]).toFixed(1)}" r="3.2" fill="${color}" class="energy-line-point"><title>${record.label} ${label}：${formatEnergy(record[key])} kWh</title></circle>`)
          .join("");
        return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${key === "total" ? 2.8 : 2.25}" stroke-linecap="round" stroke-linejoin="round" class="energy-series-line"/>${markers}`;
      })
      .join("");
    const currentRecord = records.at(-1);
    const currentIndex = records.length - 1;
    const isMonthly = range === "12m";
    const allRecordIndex = isMonthly ? model.energyRecords.findIndex((record) => record.month === currentRecord.month) : -1;
    const previousRecord = isMonthly ? model.energyRecords[allRecordIndex - 1] : records.at(-2);
    const priorYearRecord = isMonthly ? model.energyRecords[allRecordIndex - 12] : null;
    const currentMom = formatRate(percentChange(currentRecord.total, previousRecord?.total));
    const currentYoy = isMonthly ? formatRate(percentChange(currentRecord.total, priorYearRecord?.total)) : null;
    const currentPointX = x(currentIndex);
    const currentPointY = y(currentRecord.total);
    const calloutWidth = 162;
    const calloutHeight = isMonthly ? 82 : 64;
    const calloutX = Math.max(plot.left + 8, currentPointX - calloutWidth - 14);
    const calloutY = Math.max(plot.top + 4, Math.min(currentPointY - calloutHeight / 2, height - plot.bottom - calloutHeight - 4));
    const arrowY = currentPointY - calloutY;
    const currentCallout = isMonthly ? `
      <g class="energy-current-callout" transform="translate(${calloutX.toFixed(1)} ${calloutY.toFixed(1)})" role="note" aria-label="当月 ${currentRecord.label}，用电量 ${formatEnergy(currentRecord.total)} 千瓦时，环比 ${currentMom}，同比 ${currentYoy}">
        <rect width="${calloutWidth}" height="${calloutHeight}" rx="6"/>
        <path class="energy-current-callout-arrow" d="M ${calloutWidth} ${(arrowY - 6).toFixed(1)} L ${calloutWidth + 12} ${arrowY.toFixed(1)} L ${calloutWidth} ${(arrowY + 6).toFixed(1)} Z"/>
        <text x="12" y="18" class="energy-current-tooltip-month">${currentRecord.label}</text>
        <text x="12" y="39" class="energy-current-tooltip-label">当月用电量</text><text x="150" y="39" text-anchor="end" class="energy-current-tooltip-value">${formatEnergy(currentRecord.total)} kWh</text>
        <text x="12" y="57" class="energy-current-tooltip-label">环比增速</text><text x="150" y="57" text-anchor="end" class="energy-current-tooltip-value">${currentMom}</text>
        <text x="12" y="75" class="energy-current-tooltip-label">同比增速</text><text x="150" y="75" text-anchor="end" class="energy-current-tooltip-value">${currentYoy}</text>
      </g>` : `
      <g class="energy-current-callout" transform="translate(${calloutX.toFixed(1)} ${calloutY.toFixed(1)})" role="note" aria-label="${currentRecord.label}，当日用电量 ${formatEnergy(currentRecord.total)} 千瓦时，较前一日 ${currentMom}">
        <rect width="${calloutWidth}" height="${calloutHeight}" rx="6"/>
        <path class="energy-current-callout-arrow" d="M ${calloutWidth} ${(arrowY - 6).toFixed(1)} L ${calloutWidth + 12} ${arrowY.toFixed(1)} L ${calloutWidth} ${(arrowY + 6).toFixed(1)} Z"/>
        <text x="12" y="18" class="energy-current-tooltip-month">${currentRecord.label}</text>
        <text x="12" y="39" class="energy-current-tooltip-label">当日用电量</text><text x="150" y="39" text-anchor="end" class="energy-current-tooltip-value">${formatEnergy(currentRecord.total)} kWh</text>
        <text x="12" y="57" class="energy-current-tooltip-label">较前一日</text><text x="150" y="57" text-anchor="end" class="energy-current-tooltip-value">${currentMom}</text>
      </g>`;
    const currentPoint = `<circle cx="${currentPointX.toFixed(1)}" cy="${currentPointY.toFixed(1)}" r="5.5" class="energy-current-point-ring"/>`;
    const labelStep = records.length > 12 ? Math.ceil(records.length / 7) : 1;
    const xLabels = records
      .map((record, index) => (index % labelStep === 0 || index === records.length - 1 ? `<text x="${x(index).toFixed(1)}" y="${height - 19}" text-anchor="middle" class="energy-axis-label">${record.label}</text>` : ""))
      .join("");
    return `
      <svg class="energy-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${overviewTrendRangeLabels[range]}用电量变化趋势折线图" data-overview-trend-range="${range}" data-record-count="${records.length}">
        ${grid}
        <line x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${height - plot.bottom}" class="energy-axis-line"/>
        <line x1="${plot.left}" y1="${height - plot.bottom}" x2="${width - plot.right}" y2="${height - plot.bottom}" class="energy-axis-line"/>
        ${lines}
        ${currentCallout}
        ${currentPoint}
        ${xLabels}
        <text x="14" y="18" class="energy-axis-title">用电量（kWh）</text>
      </svg>`;
  }

  function renderWelcomeIllustration() {
    return `
      <svg class="overview-welcome-art" viewBox="0 0 680 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="welcomeGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#4594ee"/><stop offset="1" stop-color="#4934e9"/></linearGradient>
          <linearGradient id="towerGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22bfea"/><stop offset="1" stop-color="#3751eb"/></linearGradient>
        </defs>
        <rect width="680" height="300" fill="url(#welcomeGradient)"/>
        <g opacity=".34" fill="#27a9ec"><polygon points="0,84 68,126 68,250 0,284"/><polygon points="71,168 143,122 211,166 211,300 71,300"/><polygon points="205,176 264,134 322,172 322,300 205,300"/><polygon points="307,108 382,62 457,109 457,300 307,300"/><polygon points="498,180 559,142 618,178 618,300 498,300"/><polygon points="597,138 680,92 680,300 597,300"/></g>
        <g opacity=".9"><rect x="88" y="166" width="126" height="134" rx="4" fill="#5131e9"/><polygon points="88,166 153,132 214,166" fill="#4257ee"/><rect x="280" y="176" width="76" height="124" fill="#3368ea"/><polygon points="280,176 318,151 356,176" fill="#3786ee"/><rect x="397" y="133" width="86" height="167" fill="url(#towerGradient)"/><polygon points="397,133 439,105 483,133" fill="#29a5eb"/><rect x="559" y="211" width="70" height="89" fill="#315de5"/><polygon points="559,211 594,190 629,211" fill="#2d90ed"/></g>
        <g transform="translate(117 139)"><path d="M0 38 72 0v50L0 88Z" fill="#67cff1"/><path d="M7 42 64 12v33L7 75Z" fill="#d8f3fb"/><path d="M23 57c8-22 11-26 19-29 5 10 7 15 19 18" fill="none" stroke="#6674ec" stroke-width="8" stroke-linecap="round"/></g>
        <g transform="translate(203 162)"><ellipse cx="23" cy="32" rx="20" ry="8" fill="#1f7ae9"/><path d="M9 30c7-18 17-24 28-19 8 4 10 15 4 23" fill="none" stroke="#42c8ef" stroke-width="5"/><circle cx="23" cy="27" r="9" fill="#24bce9"/></g>
        <g transform="translate(168 139)" fill="#fff"><circle cx="0" cy="0" r="6"/><path d="M-3 7h7l3 22H-6Z"/><path d="m0 13 15 7m-15-2-12 9" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
      </svg>`;
  }

  function renderOverviewPage() {
    const energy = overviewEnergyContext();
    const lightingPercent = Math.round((energy.current.lighting / energy.current.total) * 100);
    const socketPercent = Math.round((energy.current.socket / energy.current.total) * 100);
    const hvacPercent = 100 - lightingPercent - socketPercent;
    return `
      <section class="page overview-page">
        <div class="overview-top-grid">
          <div class="overview-stat-stack">
            <article class="overview-stat-card">
              <span>设备总数</span><strong class="purple">16</strong>
              <div class="overview-stat-counts"><span>15</span><span>1</span></div>
              <div class="overview-progress"><i style="width:93.75%"></i></div>
              <div class="overview-stat-labels"><span>在线</span><span>离线</span></div>
            </article>
            <article class="overview-stat-card">
              <span>功能总数</span><strong class="blue">56</strong>
              <div class="overview-stat-counts"><span>53</span><span>3</span></div>
              <div class="overview-progress blue"><i style="width:94.64%"></i></div>
              <div class="overview-stat-labels"><span>在线</span><span>离线</span></div>
            </article>
          </div>
          <article class="overview-card overview-function-card">
            <header class="overview-card-title">功能占比</header>
            <div class="overview-function-chart" role="img" aria-label="功能占比：照明类 50%，其他 39.29%，开关 7.14%，空调 3.57%">
              <div class="overview-function-donut"><span>56<small>功能点</small></span></div>
              <span class="function-label lighting">50.00%<small>照明类</small></span>
              <span class="function-label other">39.29%<small>其他</small></span>
              <span class="function-label switch">7.14%<small>开关</small></span>
              <span class="function-label hvac">3.57%<small>空调</small></span>
            </div>
          </article>
          <article class="overview-welcome-card">
            ${renderWelcomeIllustration()}
            <div class="overview-welcome-copy"><strong>Hello, admin</strong><span>欢迎使用 HDL GraView 可视化管理平台</span></div>
          </article>
        </div>

        <section class="energy-dashboard" aria-labelledby="energyDashboardTitle">
          <header class="energy-dashboard-header">
            <h1 id="energyDashboardTitle">用电分析</h1>
            <label class="energy-period-field" for="overviewPeriod"><span>统计月份</span><select id="overviewPeriod">
              ${["2026-08", "2026-09", "2026-10"].map((month) => `<option value="${month}"${state.overview.selectedMonth === month ? " selected" : ""}>${month.replace("-", "年")}月</option>`).join("")}
            </select></label>
          </header>
          <div class="energy-overview-grid">
            <article class="overview-card energy-summary-card">
              <header class="overview-card-title">用电概览</header>
              <div class="energy-summary-columns">
                <section><h2>当月累计电量</h2>${overviewSummaryRows(energy.current)}</section>
                <section><h2>${energy.current.month.slice(0, 4)} 年累计电量</h2>${overviewSummaryRows(energy.annual)}</section>
              </div>
              <div class="energy-rate-row">
                <span>当月环比 <strong class="${energy.monthOnMonth >= 0 ? "up" : "down"}">${formatRate(energy.monthOnMonth)}</strong></span>
                <span>当月同比 <strong class="${energy.yearOnYear >= 0 ? "up" : "down"}">${formatRate(energy.yearOnYear)}</strong></span>
              </div>
            </article>
            <article class="overview-card energy-distribution-card">
              <header class="overview-card-title energy-distribution-title"><span>当月电力消耗分布</span></header>
              <div class="energy-distribution-body">
                <div class="energy-distribution-donut" style="--lighting:${lightingPercent}%;--socket:${lightingPercent + socketPercent}%" role="img" aria-label="照明 ${lightingPercent}%，插排 ${socketPercent}%，空调 ${hvacPercent}%"><span><strong>${formatEnergy(energy.current.total)}</strong><small>总用电量 / kWh</small></span></div>
                <div class="energy-distribution-legend">
                  <div><i class="energy-key lighting"></i><span>照明</span><strong>${lightingPercent}%</strong><small>${formatEnergy(energy.current.lighting)} kWh</small></div>
                  <div><i class="energy-key socket"></i><span>插排</span><strong>${socketPercent}%</strong><small>${formatEnergy(energy.current.socket)} kWh</small></div>
                  <div><i class="energy-key hvac"></i><span>空调</span><strong>${hvacPercent}%</strong><small>${formatEnergy(energy.current.hvac)} kWh</small></div>
                </div>
              </div>
            </article>
          </div>
          <article class="overview-card energy-trend-card">
            <header class="energy-trend-header"><h2>用电量变化趋势</h2><div class="energy-trend-tools"><div class="energy-range-switch overview-trend-range" role="group" aria-label="用电量趋势时间范围">${Object.entries(overviewTrendRangeLabels).map(([value, label]) => `<button type="button" class="${energy.trendRange === value ? "active" : ""}" data-action="overview-trend-range" data-range="${value}">${label}</button>`).join("")}</div><div class="energy-trend-legend"><span><i class="total"></i>总用电量</span><span><i class="lighting"></i>照明用电量</span><span><i class="hvac"></i>空调用电量</span><span><i class="socket"></i>插排用电量</span></div></div></header>
            <div class="energy-chart-wrap">${energyTrendChart(energy.trend, energy.trendRange)}</div>
          </article>
        </section>
      </section>`;
  }

  function renderNavigationPage() {
    return `
      <section class="page component-page">
        ${renderComponentCanvas()}
      </section>`;
  }

  function componentLocationPath(component) {
    const building = model.locations.find((item) => item.rooms.some((room) => room.id === component.roomId));
    const room = building?.rooms.find((item) => item.id === component.roomId);
    return [building?.name, room?.name].filter(Boolean).join("→");
  }

  function deviceLocationPath(device) {
    const building = model.locations.find((item) => item.rooms.some((room) => room.id === device.roomId));
    const room = building?.rooms.find((item) => item.id === device.roomId);
    return [building?.name, room?.name].filter(Boolean).join("→");
  }

  function componentDeviceName(component) {
    const suffix = String(component.id).replace(/\D/g, "").padStart(3, "0");
    return `MDL64-BP-${suffix}`;
  }

  function areaDetails(areaId) {
    if (areaId === "all") {
      return { id: "all", name: "天府校区", roomIds: model.locations.flatMap((building) => building.rooms.map((room) => room.id)) };
    }
    const building = model.locations.find((item) => item.id === areaId);
    if (building) return { id: building.id, name: building.name, roomIds: building.rooms.map((room) => room.id) };
    for (const item of model.locations) {
      const room = item.rooms.find((candidate) => candidate.id === areaId);
      if (room) return { id: room.id, name: `${item.name} / ${room.name}`, roomIds: [room.id] };
    }
    return areaDetails("all");
  }

  function devicesInArea(areaId) {
    const roomIds = new Set(areaDetails(areaId).roomIds);
    return model.devices.filter((device) => roomIds.has(device.roomId));
  }

  function renderCabinetAreaTree(selectedAreaId) {
    const expandedAreaIds = state.cabinetFunctions.expandedAreaIds;
    const rootExpanded = expandedAreaIds.has("all");
    return `
      <div class="cabinet-area-tree" role="tree" aria-label="区域树">
        <div class="cabinet-area-node root${selectedAreaId === "all" ? " active" : ""}" role="treeitem" aria-selected="${selectedAreaId === "all"}" aria-expanded="${rootExpanded}">
          <button class="cabinet-area-toggle" type="button" data-action="toggle-cabinet-area" data-area-id="all" aria-expanded="${rootExpanded}" aria-label="${rootExpanded ? "收起" : "展开"}天府校区"><span aria-hidden="true">›</span></button>
          <button class="cabinet-area-select" type="button" data-action="select-cabinet-area" data-area-id="all">天府校区</button>
        </div>
        ${
          rootExpanded
            ? `<div class="cabinet-area-children" role="group">
                ${model.locations
                  .map((building) => {
                    const buildingExpanded = expandedAreaIds.has(building.id);
                    return `
                      <div class="cabinet-area-group">
                        <div class="cabinet-area-node building${selectedAreaId === building.id ? " active" : ""}" role="treeitem" aria-selected="${selectedAreaId === building.id}" aria-expanded="${buildingExpanded}">
                          <button class="cabinet-area-toggle" type="button" data-action="toggle-cabinet-area" data-area-id="${building.id}" aria-expanded="${buildingExpanded}" aria-label="${buildingExpanded ? "收起" : "展开"}${escapeHtml(building.name)}"><span aria-hidden="true">›</span></button>
                          <button class="cabinet-area-select" type="button" data-action="select-cabinet-area" data-area-id="${building.id}">${escapeHtml(building.name)}</button>
                        </div>
                        ${
                          buildingExpanded
                            ? `<div class="cabinet-area-rooms" role="group">
                                ${building.rooms
                                  .map(
                                    (room) => `<button class="cabinet-area-node room${selectedAreaId === room.id ? " active" : ""}" type="button" role="treeitem" aria-selected="${selectedAreaId === room.id}" data-action="select-cabinet-area" data-area-id="${room.id}">${escapeHtml(room.name)}</button>`,
                                  )
                                  .join("")}
                              </div>`
                            : ""
                        }
                      </div>`;
                  })
                  .join("")}
              </div>`
            : ""
        }
      </div>`;
  }

  function filterCabinetDevices(devices) {
    const view = state.cabinetFunctions;
    const value = view.filterValue.trim();
    if (!value) return devices;
    if (view.filterField === "status") return devices.filter((device) => device.status === value);
    if (view.filterField === "type") return devices.filter((device) => device.type === value);

    const keyword = value.toLocaleLowerCase("zh-CN");
    const getFieldValue = {
      remark: (device) => device.remark,
      model: (device) => device.model,
      ip: (device) => device.ip,
    }[view.filterField];
    if (!getFieldValue) return devices;
    return devices.filter((device) => String(getFieldValue(device) ?? "").toLocaleLowerCase("zh-CN").includes(keyword));
  }

  function renderCabinetDeviceFilterControl(devices) {
    const view = state.cabinetFunctions;
    if (view.filterField === "status") {
      return `
        <label class="visually-hidden" for="cabinetFunctionFilterValue">状态</label>
        <select id="cabinetFunctionFilterValue" class="cabinet-query-filter-value" aria-label="状态筛选">
          <option value=""${view.filterValue ? "" : " selected"}>全部</option>
          <option value="online"${view.filterValue === "online" ? " selected" : ""}>在线</option>
          <option value="offline"${view.filterValue === "offline" ? " selected" : ""}>离线</option>
        </select>`;
    }
    if (view.filterField === "type") {
      const types = [...new Set(devices.map((device) => device.type))].sort((left, right) => left.localeCompare(right, "zh-CN"));
      return `
        <label class="visually-hidden" for="cabinetFunctionFilterValue">设备类型</label>
        <select id="cabinetFunctionFilterValue" class="cabinet-query-filter-value" aria-label="设备类型筛选">
          <option value=""${view.filterValue ? "" : " selected"}>全部</option>
          ${types.map((type) => `<option value="${escapeHtml(type)}"${view.filterValue === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
        </select>`;
    }

    const placeholders = {
      remark: "请输入设备备注",
      model: "请输入型号",
      ip: "请输入所属 IP",
    };
    return `
      <label class="cabinet-query-search" for="cabinetFunctionFilterInput">
        ${icon("search")}
        <input id="cabinetFunctionFilterInput" type="search" value="${escapeHtml(view.filterValue)}" placeholder="${placeholders[view.filterField] ?? "请输入关键字"}" autocomplete="off" aria-label="${placeholders[view.filterField] ?? "请输入关键字"}">
      </label>`;
  }

  function getCabinetDeviceQueryContext() {
    const view = state.cabinetFunctions;
    const selectedArea = areaDetails(view.selectedAreaId);
    const areaDevices = devicesInArea(selectedArea.id);
    const activeCabinets = model.cabinets.filter(
      (cabinet) => cabinet.status === "active" && areaDevices.some((device) => displayCabinet(device)?.id === cabinet.id),
    );
    const hasUnclassified = areaDevices.some((device) => !displayCabinet(device));
    const cabinetOptions = [
      ...activeCabinets.map((cabinet) => ({ id: cabinet.id, name: cabinet.name })),
      ...(hasUnclassified ? [{ id: "unclassified", name: "未分类" }] : []),
    ];
    if (!cabinetOptions.some((option) => option.id === view.selectedCabinetId)) {
      view.selectedCabinetId = cabinetOptions[0]?.id ?? "unclassified";
    }

    const selectedCabinet = cabinetOptions.find((option) => option.id === view.selectedCabinetId) ?? { id: "unclassified", name: "未分类" };
    const cabinetDevices = areaDevices.filter((device) =>
      selectedCabinet.id === "unclassified" ? !displayCabinet(device) : displayCabinet(device)?.id === selectedCabinet.id,
    );
    if (view.filterField === "type" && view.filterValue && !cabinetDevices.some((device) => device.type === view.filterValue)) {
      view.filterValue = "";
    }
    return {
      selectedArea,
      areaDevices,
      cabinetOptions,
      selectedCabinet,
      cabinetDevices,
      visibleDevices: filterCabinetDevices(cabinetDevices),
    };
  }

  function renderCabinetFunctionQueryPage() {
    const view = state.cabinetFunctions;
    const { selectedArea, areaDevices, cabinetOptions, selectedCabinet, cabinetDevices, visibleDevices } = getCabinetDeviceQueryContext();
    const totalPages = Math.max(1, Math.ceil(visibleDevices.length / view.pageSize));
    if (view.page > totalPages) view.page = totalPages;
    const pageDevices = visibleDevices.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
    const pageIds = pageDevices.map((device) => device.id);
    const selectedPageCount = pageIds.filter((id) => view.selected.has(id)).length;
    const allPageSelected = pageIds.length > 0 && selectedPageCount === pageIds.length;
    const somePageSelected = selectedPageCount > 0 && !allPageSelected;
    const detailRows = pageDevices.length
      ? pageDevices
          .map((device) => {
            const cabinet = displayCabinet(device);
            const selected = view.selected.has(device.id);
            return `
              <tr class="${selected ? "selected" : ""}">
                <td class="checkbox-cell"><input class="table-checkbox" type="checkbox" data-action="select-cabinet-function" data-id="${device.id}"${selected ? " checked" : ""} aria-label="选择 ${escapeHtml(device.remark)}"></td>
                <td title="${escapeHtml(device.remark)}">${escapeHtml(device.remark)}</td>
                <td>${escapeHtml(device.type)}</td>
                <td><span class="status-pill ${device.status}">${device.status === "online" ? "在线" : "离线"}</span></td>
                <td>${escapeHtml(device.protocol)}</td>
                <td title="${escapeHtml(device.model)}">${escapeHtml(device.model)}</td>
                <td title="${escapeHtml(device.product)}">${escapeHtml(device.product)}</td>
                <td title="${escapeHtml(device.address)}">${escapeHtml(device.address)}</td>
                <td>${escapeHtml(device.connection)}</td>
                <td>${escapeHtml(device.ip)}</td>
                <td class="device-cabinet-cell" title="${escapeHtml(cabinet?.name ?? "")}">${cabinetColorText(cabinet?.name, cabinet)}</td>
                <td title="${escapeHtml(deviceLocationPath(device))}">${escapeHtml(deviceLocationPath(device))}</td>
              </tr>`;
          })
          .join("")
      : `<tr><td colspan="12"><div class="empty-state"><div><strong>暂无设备明细</strong>${cabinetDevices.length ? "当前筛选条件下没有匹配数据" : "当前区域与配电箱下没有匹配数据"}</div></div></td></tr>`;

    const cabinetOptionMarkup = cabinetOptions.length
      ? cabinetOptions
          .map((option) => {
            const devices = areaDevices.filter((device) =>
              option.id === "unclassified" ? !displayCabinet(device) : displayCabinet(device)?.id === option.id,
            );
            const online = devices.filter((device) => device.status === "online").length;
            return `
              <button class="cabinet-device-option${selectedCabinet.id === option.id ? " active" : ""}" type="button" data-action="select-cabinet-query-cabinet" data-cabinet-id="${option.id}" aria-pressed="${selectedCabinet.id === option.id}">
                <span>${escapeHtml(option.name)}</span><span class="cabinet-device-option-count">（${online}/${devices.length}）</span>
              </button>`;
          })
          .join("")
      : `<div class="cabinet-filter-empty">该区域暂无配电箱</div>`;

    return `
      <section class="page cabinet-device-page cabinet-query-page">
        <div class="cabinet-device-workbench cabinet-query-workbench">
          <aside class="cabinet-device-explorer cabinet-query-explorer" aria-label="区域与配电箱筛选">
            <section class="cabinet-query-filter-section cabinet-area-filter-section">
              <div class="cabinet-device-explorer-header">区域</div>
              ${renderCabinetAreaTree(selectedArea.id)}
            </section>
            <section class="cabinet-query-filter-section cabinet-filter-section">
              <div class="cabinet-device-explorer-header">配电箱</div>
              <div class="cabinet-device-options">${cabinetOptionMarkup}</div>
            </section>
          </aside>
          <section class="cabinet-device-stage cabinet-query-stage">
            <header class="cabinet-query-stage-header">
              <div><strong>${escapeHtml(selectedCabinet.name)}</strong><span>${escapeHtml(selectedArea.name)}</span></div>
            </header>
            <div class="cabinet-query-toolbar" role="toolbar" aria-label="设备筛选与导出">
              <label class="visually-hidden" for="cabinetFunctionFilterField">筛选字段</label>
              <select id="cabinetFunctionFilterField" class="cabinet-query-filter-field" aria-label="筛选字段">
                <option value="status"${view.filterField === "status" ? " selected" : ""}>状态</option>
                <option value="remark"${view.filterField === "remark" ? " selected" : ""}>设备备注</option>
                <option value="type"${view.filterField === "type" ? " selected" : ""}>设备类型</option>
                <option value="model"${view.filterField === "model" ? " selected" : ""}>型号</option>
                <option value="ip"${view.filterField === "ip" ? " selected" : ""}>所属 IP</option>
              </select>
              <div class="cabinet-query-filter-control">${renderCabinetDeviceFilterControl(cabinetDevices)}</div>
              <button class="cabinet-query-export-button" type="button" data-action="export-cabinet-functions" title="导出当前筛选后的全部数据">${icon("export")}导出</button>
            </div>
            <section class="cabinet-query-section" aria-label="设备明细">
              <div class="table-wrap cabinet-query-table-wrap">
                <table class="data-table cabinet-query-table">
                  <colgroup><col style="width:54px"><col style="width:180px"><col style="width:110px"><col style="width:82px"><col style="width:100px"><col style="width:160px"><col style="width:180px"><col style="width:240px"><col style="width:100px"><col style="width:130px"><col style="width:150px"><col style="width:170px"></colgroup>
                  <thead><tr><th class="checkbox-cell"><input class="table-checkbox" type="checkbox" data-action="select-all-cabinet-functions"${allPageSelected ? " checked" : ""}${somePageSelected ? ' data-indeterminate="true" aria-checked="mixed"' : ""} aria-label="选择本页全部设备"></th><th>设备备注</th><th>设备类型</th><th>状态</th><th>协议</th><th>型号</th><th>产品名</th><th>设备地址</th><th>连接方式</th><th>所属 IP</th><th>配电箱</th><th>楼层节点</th></tr></thead>
                  <tbody>${detailRows}</tbody>
                </table>
              </div>
              ${pagerHtml(visibleDevices.length, view.page, view.pageSize, "cabinetFunctions")}
            </section>
          </section>
        </div>
      </section>`;
  }

  function renderComponentCanvas(switcher = "") {
    const selected = state.navigation.selectedLocation;
    const selectedRoom = model.locations.flatMap((item) => item.rooms).find((item) => item.id === selected) ?? null;
    const selectedBuilding = model.locations.find((item) => item.id === selected || item.rooms.some((room) => room.id === selected)) ?? model.locations[0];
    const activeRoom = selectedRoom ?? selectedBuilding.rooms[0];
    const pageComponents = model.components.filter((item) => item.roomId === activeRoom.id);
    const simpleComponents = pageComponents.filter((item) => item.controlType === "switch");
    const detailedComponents = pageComponents.filter((item) => item.controlType !== "switch");

    const tree = model.locations
      .map(
        (building) => `
          <div class="page-tree-group">
            <button class="page-tree-building${selectedBuilding.id === building.id ? " expanded" : ""}" type="button" data-action="set-location" data-scope="navigation" data-location="${building.id}">⌄ ${escapeHtml(building.name)}</button>
            <div class="page-tree-rooms">
              ${building.rooms.map((room) => `<button class="page-tree-room${activeRoom.id === room.id ? " active" : ""}" type="button" data-action="set-location" data-scope="navigation" data-location="${room.id}" data-page-tree-name="${escapeHtml(room.name.toLocaleLowerCase("zh-CN"))}">${escapeHtml(room.name)}</button>`).join("")}
            </div>
          </div>`,
      )
      .join("");

    return `
      <div class="component-workbench">
        <aside class="component-page-explorer">
          <div class="page-explorer-search">
            ${icon("search")}
            <input id="pageTreeSearch" placeholder="页面" autocomplete="off" aria-label="搜索页面">
            <button type="button" data-action="add-page-placeholder" aria-label="新增页面">＋</button>
          </div>
          <div class="page-tree-root">⌄ <strong>Demo</strong></div>
          <div class="page-tree-content">${tree}</div>
        </aside>
        <section class="component-stage">
          <header class="component-stage-toolbar">
            <div class="stage-breadcrumb"><span>Demo</span><i>/</i><span>${escapeHtml(selectedBuilding.name)}</span><i>/</i><strong>${escapeHtml(activeRoom.name)}</strong></div>
            <div class="stage-global-controls">
              <button class="global-control-button open" type="button" data-action="control-all-components" data-control-scope="room" data-room-id="${activeRoom.id}" data-value="on">全开</button>
              <button class="global-control-button close" type="button" data-action="control-all-components" data-control-scope="room" data-room-id="${activeRoom.id}" data-value="off">全关</button>
            </div>
            ${switcher}
          </header>
          <div class="component-stage-canvas">
            ${simpleComponents.length ? `<div class="simple-components-row">${simpleComponents.map(renderSimpleSwitch).join("")}</div>` : ""}
            ${detailedComponents.length ? `<div class="detailed-components-grid">${detailedComponents.map((component) => renderControlWidget(component, "canvas")).join("")}</div>` : ""}
            ${pageComponents.length ? "" : `<div class="component-empty"><strong>当前页面暂无组件</strong><span>请切换其他页面或进入编辑模式添加组件</span></div>`}
            <button class="floating-save-button" type="button" data-action="save-component-layout">保存</button>
          </div>
        </section>
      </div>`;
  }

  function renderComponentEditorPage() {
    const component = getComponent(state.navigation.editorComponentId);
    if (!component) {
      state.navigation.editorComponentId = null;
      return renderNavigationPage();
    }
    const room = model.locations.flatMap((item) => item.rooms).find((item) => item.id === component.roomId) ?? null;
    const building = model.locations.find((item) => item.rooms.some((candidate) => candidate.id === component.roomId)) ?? null;
    const locationPath = ["Demo", building?.name, room?.name].filter(Boolean).join(" → ");

    return `
      <section class="page component-editor-page">
        <div class="component-editor-shell">
          <header class="component-editor-commandbar">
            <button class="editor-back-button" type="button" data-action="close-component-editor" aria-label="返回导航">${icon("back")}</button>
            <h1>编辑功能</h1>
            <button class="editor-command-button" type="button" data-action="editor-toolbar-placeholder" data-message="已恢复默认样式">▦<span>默认样式</span></button>
            <button class="editor-command-button" type="button" data-action="editor-undo">↶<span>撤销</span></button>
            <button class="editor-command-button" type="button" data-action="editor-redo">↷<span>恢复</span></button>
          </header>

          <div class="component-editor-stylebar" aria-label="组件样式工具栏">
            <label>宽 <input id="editorWidth" type="number" value="320" min="240" max="680" aria-label="组件宽度"></label>
            <span class="editor-lock">▣</span>
            <label>高 <input id="editorHeight" type="number" value="${["hvac", "curtain", "fan"].includes(component.controlType) ? 180 : 96}" min="80" max="480" aria-label="组件高度"></label>
            <span class="editor-style-divider"></span>
            <label>字体 <select aria-label="字体"><option>微软雅黑</option></select></label>
            <label>字号 <select aria-label="字号"><option>12</option><option>14</option><option>16</option></select></label>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="粗体样式已切换"><b>B</b></button>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="斜体样式已切换"><i>I</i></button>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="下划线样式已切换"><u>U</u></button>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="文字颜色已切换">A</button>
            <span class="editor-style-divider"></span>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="已左对齐">☷</button>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="已居中对齐">☰</button>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="已右对齐">☷</button>
            <span class="editor-style-divider"></span>
            <label>填充：<input type="color" value="#ffffff" aria-label="填充颜色"></label>
            <button class="editor-style-icon-button" type="button" data-action="editor-toolbar-placeholder" data-message="背景图片入口">▧</button>
            <label>边框：<select aria-label="边框宽度"><option>0</option><option>1</option><option>2</option></select></label>
            <input type="color" value="#8d4de8" aria-label="边框颜色">
          </div>

          <div class="component-editor-canvas">
            <div class="component-editor-preview" style="--editor-preview-width:320px;--editor-preview-height:${["hvac", "curtain", "fan"].includes(component.controlType) ? "180px" : "96px"}">
              ${renderControlWidget(component, "editor")}
            </div>
          </div>
        </div>

        <div class="component-editor-bottom-grid">
          <section class="component-editor-info-card">
            <h2>组件信息</h2>
            <div class="component-editor-form">
              <label>名称<input id="componentEditorName" value="${escapeHtml(component.name)}" maxlength="30" autocomplete="off"></label>
              <div class="form-error" id="componentEditorNameError"></div>
              <label>类型<input value="${escapeHtml(component.type)}" disabled></label>
              <label>描述<textarea id="componentEditorDescription" maxlength="80">${escapeHtml(component.remark)}</textarea></label>
            </div>
          </section>
          <section class="component-editor-node-card">
            <header><h2>导航节点</h2><button class="editor-add-node-button" type="button" data-action="editor-add-node">添加</button></header>
            <div class="editor-node-table-wrap">
              <table class="editor-node-table">
                <thead><tr><th>编号</th><th>所属页面</th><th>操作</th></tr></thead>
                <tbody><tr><td>1</td><td><select class="editor-node-select" id="componentEditorPage">${roomAreaOptions(component.roomId, false)}</select></td><td><button class="editor-node-remove" type="button" data-action="editor-remove-node" aria-label="删除导航节点">${icon("trash")}</button></td></tr></tbody>
              </table>
            </div>
            <p>当前导航路径：${escapeHtml(locationPath)}</p>
          </section>
        </div>
        <button class="component-editor-save" type="button" data-action="save-component" data-id="${component.id}">保存</button>
      </section>`;
  }

  function filteredDevices() {
    const view = state.devices;
    const keyword = view.appliedKeyword.trim().toLocaleLowerCase("zh-CN");
    return model.devices.filter((device) => {
      const fieldValue = {
        remark: device.remark,
        model: device.model,
        ip: device.ip,
      }[view.filterField] ?? device.remark;
      const cabinet = displayCabinet(device);
      return (
        (!keyword || String(fieldValue).toLocaleLowerCase("zh-CN").includes(keyword)) &&
        (view.appliedType === "all" || device.type === view.appliedType) &&
        (view.appliedCabinet === "all" || cabinet?.id === view.appliedCabinet)
      );
    });
  }

  function renderDevicePage() {
    const view = state.devices;
    const activeCabinets = model.cabinets.filter((cabinet) => cabinet.status === "active");
    if (view.appliedCabinet !== "all" && !activeCabinets.some((cabinet) => cabinet.id === view.appliedCabinet)) {
      view.appliedCabinet = "all";
    }
    const filtered = filteredDevices();
    const totalPages = Math.max(1, Math.ceil(filtered.length / view.pageSize));
    if (view.page > totalPages) view.page = totalPages;
    const pageItems = filtered.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
    const pageIds = pageItems.map((item) => item.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => view.selected.has(id));
    const rows = pageItems.length
      ? pageItems
          .map((device) => {
            const selected = view.selected.has(device.id);
            const cabinet = displayCabinet(device);
            return `
              <tr class="${selected ? "selected" : ""}">
                <td class="checkbox-cell"><input class="table-checkbox" type="checkbox" data-action="select-device" data-id="${device.id}"${selected ? " checked" : ""} aria-label="选择 ${escapeHtml(device.remark)}"></td>
                <td title="${escapeHtml(device.remark)}">${escapeHtml(device.remark)}</td>
                <td>${escapeHtml(device.type)}</td>
                <td><span class="status-pill ${device.status}">${device.status === "online" ? "在线" : "离线"}</span></td>
                <td>${escapeHtml(device.protocol)}</td>
                <td title="${escapeHtml(device.model)}">${escapeHtml(device.model)}</td>
                <td title="${escapeHtml(device.product)}">${escapeHtml(device.product)}</td>
                <td title="${escapeHtml(device.address)}">${escapeHtml(device.address)}</td>
                <td>${escapeHtml(device.connection)}</td>
                <td>${escapeHtml(device.ip)}</td>
                <td class="device-cabinet-cell" title="${escapeHtml(cabinet?.name ?? "")}">${cabinetColorText(cabinet?.name, cabinet)}</td>
                <td title="${escapeHtml(deviceLocationPath(device))}">${escapeHtml(deviceLocationPath(device))}</td>
              </tr>`;
          })
          .join("")
      : `<tr><td colspan="12"><div class="empty-state"><div><strong>没有匹配的设备</strong>请调整设备备注、型号、IP、设备类型或配电箱</div></div></td></tr>`;

    return `
      <section class="page device-reference-page">
        <div class="page-panel no-padding device-reference-panel">
          <form class="device-reference-toolbar" data-form="device-filter">
            <div class="device-reference-filters">
              <select id="deviceFilterField" aria-label="搜索字段">
                <option value="remark"${view.filterField === "remark" ? " selected" : ""}>备注</option>
                <option value="model"${view.filterField === "model" ? " selected" : ""}>型号</option>
                <option value="ip"${view.filterField === "ip" ? " selected" : ""}>所属 IP</option>
              </select>
              <div class="reference-search">${icon("search")}<input id="deviceKeyword" value="${escapeHtml(view.appliedKeyword)}" placeholder="搜索" autocomplete="off"></div>
              <select id="deviceType" aria-label="设备类型">
                <option value="all">请选择</option>
                ${deviceTypes().map((type) => `<option value="${escapeHtml(type)}"${view.appliedType === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
              </select>
              <select id="deviceCabinet" aria-label="配电箱">
                <option value="all">配电箱</option>
                ${activeCabinets.map((cabinet) => `<option value="${cabinet.id}"${view.appliedCabinet === cabinet.id ? " selected" : ""}>${escapeHtml(cabinet.name)}</option>`).join("")}
              </select>
              <button class="visually-hidden" type="submit">搜索</button>
            </div>
            <div class="device-reference-actions">
              <button class="reference-link-button" type="button" data-action="modify-ip">${icon("edit")}修改IP</button>
              <button class="reference-link-button" type="button" data-action="monitor-status">${icon("power")}监测状态</button>
              <button class="reference-export-button" type="button" data-action="export-devices">${icon("export")}导出</button>
            </div>
          </form>
          <div class="table-wrap device-reference-table-wrap">
            <table class="data-table device-table">
              <colgroup>
                <col style="width:54px"><col style="width:180px"><col style="width:110px"><col style="width:82px"><col style="width:100px"><col style="width:160px"><col style="width:180px"><col style="width:240px"><col style="width:100px"><col style="width:130px"><col style="width:150px"><col style="width:170px">
              </colgroup>
              <thead><tr>
                <th class="checkbox-cell"><input class="table-checkbox" type="checkbox" data-action="select-all-devices"${allPageSelected ? " checked" : ""} aria-label="选择本页全部设备"></th>
                <th>设备备注</th><th>设备类型</th><th>状态</th><th>协议</th><th>型号</th><th>产品名</th><th>设备地址</th><th>连接方式</th><th>所属 IP</th><th>配电箱</th><th>楼层节点</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${pagerHtml(filtered.length, view.page, view.pageSize, "devices")}
        </div>
      </section>`;
  }

  function renderHistoryPage() {
    const view = state.history;
    const filtered = model.history.filter((entry) => {
      const typeMatch = view.appliedType === "all" || entry.type === view.appliedType;
      const dateMatch = view.appliedDate === "all" || (view.appliedDate === "today" && entry.at.startsWith("2026-08-25")) || (view.appliedDate === "7days" && entry.at >= "2026-08-19");
      return typeMatch && dateMatch;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / view.pageSize));
    if (view.page > totalPages) view.page = totalPages;
    const pageItems = filtered.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
    const rows = pageItems.length
      ? pageItems
          .map((entry) => {
            const message = formatHistoryMessage(entry);
            return `<tr><td>${escapeHtml(entry.type)}</td><td>${escapeHtml(entry.at)}</td><td class="message-content">${message}</td></tr>`;
          })
          .join("")
      : `<tr><td colspan="3"><div class="empty-state"><div><strong>暂无历史记录</strong>请调整类型或日期条件</div></div></td></tr>`;

    return `
      <section class="page">
        <div class="page-panel">
          <div class="page-header history-page-header">
            <div class="toolbar-actions">
              <button class="button danger-outline" type="button" data-action="clear-history">清空记录</button>
              <button class="button primary" type="button" data-action="export-history">${icon("export")}导出</button>
            </div>
          </div>
          <div class="toolbar compact">
            <div class="toolbar-group">
              <div class="field wide"><select id="historyType"><option value="all">类型 / 全部</option><option value="设备离线"${view.appliedType === "设备离线" ? " selected" : ""}>设备离线</option><option value="应用操作"${view.appliedType === "应用操作" ? " selected" : ""}>应用操作</option><option value="系统操作"${view.appliedType === "系统操作" ? " selected" : ""}>系统操作</option></select></div>
              <div class="field"><select id="historyDate"><option value="all">日期 / 所有</option><option value="today"${view.appliedDate === "today" ? " selected" : ""}>今天</option><option value="7days"${view.appliedDate === "7days" ? " selected" : ""}>近 7 天</option></select></div>
            </div>
          </div>
          <div class="table-wrap" style="margin-top:20px">
            <table class="data-table history-table">
              <colgroup><col style="width:22%"><col style="width:28%"><col style="width:50%"></colgroup>
              <thead><tr><th>类型</th><th>日期和时间</th><th>消息内容</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${pagerHtml(filtered.length, view.page, view.pageSize, "history")}
        </div>
      </section>`;
  }

  function formatHistoryMessage(entry) {
    const escaped = escapeHtml(entry.message);
    if (entry.type !== "设备离线") return escaped;
    const ip = entry.ip ? `<span class="message-ip">IP地址：${escapeHtml(entry.ip)}</span>` : "";
    if (!entry.message.startsWith("[")) return `${escaped}${ip}`;
    const endIndex = entry.message.indexOf("]");
    if (endIndex < 0) return `${escaped}${ip}`;
    const locationParts = entry.message
      .slice(1, endIndex)
      .split(/\s*\/\s*/);
    if (locationParts.length < 3) return `${escaped}${ip}`;
    const cabinetName = locationParts.slice(2).join(" / ");
    const cabinet = entry.cabinetId ? getCabinet(entry.cabinetId) : null;
    const location = `[${escapeHtml(locationParts[0])} / ${escapeHtml(locationParts[1])} / ${cabinetColorText(cabinetName, cabinet)}]`;
    const rest = escapeHtml(entry.message.slice(endIndex + 1).trim());
    return `<span class="message-location">${location}</span>${rest}${ip}`;
  }

  function historyMessageText(entry) {
    return entry.type === "设备离线" && entry.ip ? `${entry.message} IP地址：${entry.ip}` : entry.message;
  }

  function energyFilterOptions(values, selected, allLabel) {
    return [`<option value="all"${selected === "all" ? " selected" : ""}>${escapeHtml(allLabel)}</option>`, ...values.map((value) => `<option value="${escapeHtml(value)}"${selected === value ? " selected" : ""}>${escapeHtml(value)}</option>`)].join("");
  }

  function uniqueEnergyValues(field) {
    return [...new Set(model.energyStatistics.map((item) => item[field]).filter((value) => value && value !== "—"))];
  }

  function energyAreaMatches(area, selectedArea) {
    return selectedArea === "all" || area === selectedArea || area.startsWith(`${selectedArea} / `);
  }

  function renderEnergyAreaTreeNodes(nodes, selectedValue, context, targetKey = "", depth = 0) {
    return nodes.map((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const containsSelection = selectedValue === node.value || selectedValue.startsWith(`${node.value} / `);
      const expanded = hasChildren && (depth === 0 || containsSelection);
      return `
        <div class="energy-region-node${expanded ? " expanded" : ""}" data-energy-region-node>
          <div class="energy-region-node-row" style="--energy-region-depth:${depth}">
            ${hasChildren ? `<button class="energy-region-branch" type="button" data-action="toggle-energy-region-node" aria-expanded="${expanded}" aria-label="展开或收起${escapeHtml(node.name)}"><i></i></button>` : `<span class="energy-region-branch-spacer"></span>`}
            <button class="energy-region-option${selectedValue === node.value ? " selected" : ""}" type="button" data-action="select-energy-region" data-region-context="${escapeHtml(context)}" data-region-target="${escapeHtml(targetKey)}" data-region-value="${escapeHtml(node.value)}">${escapeHtml(node.name)}</button>
          </div>
          ${hasChildren ? `<div class="energy-region-children">${renderEnergyAreaTreeNodes(node.children, selectedValue, context, targetKey, depth + 1)}</div>` : ""}
        </div>`;
    }).join("");
  }

  function renderEnergyAreaPicker({ value, context, targetKey = "", allowAll = false, compact = false, placeholder = "统计区域", allLabel = placeholder, allOptionLabel = "全部区域" }) {
    const displayValue = value === "all" ? allLabel : value || placeholder;
    return `
      <div class="energy-region-picker${compact ? " compact" : ""}" data-energy-region-picker>
        <button class="energy-region-trigger" type="button" data-action="toggle-energy-region-picker" aria-haspopup="tree" aria-expanded="false" title="${escapeHtml(displayValue)}"><span>${escapeHtml(displayValue)}</span><i></i></button>
        <div class="energy-region-panel" role="tree">
          ${allowAll ? `<button class="energy-region-all${value === "all" ? " selected" : ""}" type="button" data-action="select-energy-region" data-region-context="${escapeHtml(context)}" data-region-target="${escapeHtml(targetKey)}" data-region-value="all">${escapeHtml(allOptionLabel)}</button>` : ""}
          ${renderEnergyAreaTreeNodes(model.energyAreas, value, context, targetKey)}
        </div>
      </div>`;
  }

  function filteredEnergyStatistics() {
    const view = state.energyClassification;
    const deviceRemark = view.deviceRemark.trim().toLocaleLowerCase("zh-CN");
    const deviceModel = view.deviceModel.trim().toLocaleLowerCase("zh-CN");
    const functionName = view.functionName.trim().toLocaleLowerCase("zh-CN");
    const filtered = model.energyStatistics.filter((item) => {
      if (deviceRemark && !item.deviceRemark.toLocaleLowerCase("zh-CN").includes(deviceRemark)) return false;
      if (view.deviceType !== "all" && item.deviceType !== view.deviceType) return false;
      if (view.protocol !== "all" && item.protocol !== view.protocol) return false;
      if (deviceModel && !item.deviceModel.toLocaleLowerCase("zh-CN").includes(deviceModel)) return false;
      if (view.mode !== "all" && item.mode !== view.mode) return false;
      if (functionName && !item.functionName.toLocaleLowerCase("zh-CN").includes(functionName)) return false;
      if (view.usageType !== "all" && item.usageType !== view.usageType) return false;
      if (!energyAreaMatches(item.statisticsArea, view.statisticsArea)) return false;
      if (view.dataStatus !== "all" && item.dataStatus !== view.dataStatus) return false;
      if (view.abnormalOnly && item.dataStatus === "正常") return false;
      return true;
    });
    if (!view.sortKey) return filtered;
    const direction = view.sortDirection === "desc" ? -1 : 1;
    return filtered.sort((left, right) => {
      const leftValue = left[view.sortKey];
      const rightValue = right[view.sortKey];
      const leftMissing = !Number.isFinite(leftValue);
      const rightMissing = !Number.isFinite(rightValue);
      if (leftMissing && rightMissing) return 0;
      if (leftMissing) return 1;
      if (rightMissing) return -1;
      return (leftValue - rightValue) * direction;
    });
  }

  function energyMeasurement(value, fractionDigits = 1) {
    if (!Number.isFinite(value)) return "--";
    return value.toLocaleString("zh-CN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  }

  function energySortButton(key, label) {
    const view = state.energyClassification;
    const active = view.sortKey === key;
    const direction = active ? view.sortDirection : "";
    return `<button class="sort-button${active ? ` active ${direction}` : ""}" type="button" data-action="sort-energy" data-sort-key="${escapeHtml(key)}" aria-label="按${escapeHtml(label)}${active && direction === "asc" ? "降序" : "升序"}排列">${escapeHtml(label)}<span class="sort-glyph" aria-hidden="true"><i class="sort-glyph-up"></i><i class="sort-glyph-down"></i></span></button>`;
  }

  function energyStatusPill(value, kind = "neutral") {
    const className = kind === "data" ? (value === "正常" ? "success" : value === "待取数" ? "warning" : "danger") : value === "已分类" ? "success" : value === "部分分类" ? "warning" : "disabled";
    return `<span class="status-pill ${className}">${escapeHtml(value)}</span>`;
  }

  function renderEnergyClassificationPage() {
    const view = state.energyClassification;
    const filtered = filteredEnergyStatistics();
    const pageCount = Math.max(1, Math.ceil(filtered.length / view.pageSize));
    view.page = Math.min(view.page, pageCount);
    const pageItems = filtered.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
    const usageTypes = model.energyTypes.filter((item) => item.enabled).map((item) => item.name);
    const rows = pageItems.length
      ? pageItems.map((item) => `
          <tr>
            <td title="${escapeHtml(item.deviceRemark)}">${escapeHtml(item.deviceRemark)}</td>
            <td>${escapeHtml(item.deviceType)}</td>
            <td>${escapeHtml(item.protocol)}</td>
            <td title="${escapeHtml(item.deviceModel)}">${escapeHtml(item.deviceModel)}</td>
            <td>${escapeHtml(item.mode)}</td>
            <td title="${escapeHtml(item.functionName)}">${escapeHtml(item.functionName)}</td>
            <td title="${escapeHtml(item.statisticsArea)}">${escapeHtml(item.statisticsArea)}</td>
            <td>${escapeHtml(item.usageType)}</td>
            <td>${energyMeasurement(item.currentAmpere)}</td>
            <td>${energyMeasurement(item.voltage)}</td>
            <td>${energyMeasurement(item.cumulativeEnergy)}</td>
            <td>${energyStatusPill(item.dataStatus, "data")}</td>
            <td class="action-cell energy-row-actions">
              <button class="action-link" type="button" data-action="energy-details" data-id="${item.id}">详情</button>
              <button class="action-link" type="button" data-action="energy-edit" data-id="${item.id}">编辑</button>
            </td>
          </tr>`).join("")
      : `<tr><td colspan="13"><div class="empty-state"><div><strong>没有匹配的数据</strong>请调整筛选条件</div></div></td></tr>`;

    return `
      <section class="page device-reference-page energy-reference-page">
        <div class="page-panel no-padding device-reference-panel energy-reference-panel">
          <div class="device-reference-toolbar energy-reference-toolbar">
            <div class="device-reference-filters energy-reference-filters" aria-label="能源统计分类筛选">
              <label class="reference-search energy-filter-search">${icon("search")}<input type="search" value="${escapeHtml(view.deviceRemark)}" placeholder="设备备注" autocomplete="off" aria-label="设备备注" data-energy-text-filter="deviceRemark"></label>
              <select data-energy-filter="deviceType" aria-label="设备类型">${energyFilterOptions(uniqueEnergyValues("deviceType"), view.deviceType, "设备类型")}</select>
              <select data-energy-filter="protocol" aria-label="协议">${energyFilterOptions(uniqueEnergyValues("protocol"), view.protocol, "协议")}</select>
              <label class="reference-search energy-filter-search">${icon("search")}<input type="search" value="${escapeHtml(view.deviceModel)}" placeholder="型号" autocomplete="off" aria-label="型号" data-energy-text-filter="deviceModel"></label>
              <select data-energy-filter="mode" aria-label="统计模式">${energyFilterOptions(uniqueEnergyValues("mode"), view.mode, "统计模式")}</select>
              <label class="reference-search energy-filter-search">${icon("search")}<input type="search" value="${escapeHtml(view.functionName)}" placeholder="功能名称" autocomplete="off" aria-label="功能名称" data-energy-text-filter="functionName"></label>
              ${renderEnergyAreaPicker({ value: view.statisticsArea, context: "filter", allowAll: true, compact: true })}
              <select data-energy-filter="usageType" aria-label="用电类型">${energyFilterOptions(usageTypes, view.usageType, "用电类型")}</select>
              <select data-energy-filter="dataStatus" aria-label="数据状态">${energyFilterOptions(uniqueEnergyValues("dataStatus"), view.dataStatus, "数据状态")}</select>
            </div>
            <div class="device-reference-actions energy-reference-actions">
              <button class="reference-link-button" type="button" data-action="manage-energy-types">${icon("manage")}用电类型</button>
              <button class="reference-export-button" type="button" data-action="open-energy-add">${icon("plus")}添加</button>
            </div>
          </div>
          <div class="table-wrap device-reference-table-wrap energy-reference-table-wrap">
            <table class="data-table energy-reference-table">
              <colgroup>
                <col style="width:150px"><col style="width:80px"><col style="width:105px"><col style="width:140px"><col style="width:80px"><col style="width:130px"><col style="width:150px"><col style="width:80px"><col style="width:90px"><col style="width:90px"><col style="width:125px"><col style="width:90px"><col style="width:120px">
              </colgroup>
              <thead><tr><th>设备备注</th><th>设备类型</th><th>协议</th><th>型号</th><th>统计模式</th><th>功能名称</th><th>统计区域</th><th>用电类型</th><th>${energySortButton("currentAmpere", "电流(A)")}</th><th>${energySortButton("voltage", "电压(V)")}</th><th>${energySortButton("cumulativeEnergy", "累计能耗(kW·h)")}</th><th>数据状态</th><th>操作</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${pagerHtml(filtered.length, view.page, view.pageSize, "energyClassification")}
        </div>
      </section>`;
  }

  function filteredEnergyAssignmentRows() {
    const view = state.energyAssignment;
    const keyword = view.deviceRemark.trim().toLocaleLowerCase("zh-CN");
    return model.energyAssignmentRows.filter((item) => {
      if (!energyAreaMatches(item.area, view.filterArea)) return false;
      if (keyword && !item.deviceRemark.toLocaleLowerCase("zh-CN").includes(keyword)) return false;
      if (view.usageType === "未分配" && item.usageType) return false;
      if (!["all", "未分配"].includes(view.usageType) && item.usageType !== view.usageType) return false;
      return true;
    });
  }

  function renderEnergyAssignmentPage() {
    const view = state.energyAssignment;
    const filtered = filteredEnergyAssignmentRows();
    const pageCount = Math.max(1, Math.ceil(filtered.length / view.pageSize));
    view.page = Math.min(view.page, pageCount);
    const pageItems = filtered.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
    const pageIds = pageItems.map((item) => item.id);
    const selectedOnPage = pageIds.filter((id) => view.selected.has(id)).length;
    const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
    const partiallySelected = selectedOnPage > 0 && !allSelected;
    const usageTypes = model.energyTypes.filter((item) => item.enabled).map((item) => item.name);
    const rows = pageItems.length
      ? pageItems.map((item) => `
          <tr${view.selected.has(item.id) ? ` class="selected-row"` : ""}>
            <td class="checkbox-cell"><input type="checkbox" aria-label="选择${escapeHtml(item.deviceRemark)}${escapeHtml(item.circuitLabel)}" data-action="select-energy-assignment" data-id="${escapeHtml(item.id)}"${view.selected.has(item.id) ? " checked" : ""}></td>
            <td><span class="energy-device-kind ${item.deviceType === "电表" ? "meter" : "breaker"}">${escapeHtml(item.deviceType)}</span></td>
            <td><div class="energy-assignment-device"><strong>${escapeHtml(item.deviceRemark)}</strong><span>${escapeHtml(item.circuitLabel)}</span></div></td>
            <td>${escapeHtml(item.phase || "—")}</td>
            <td>${item.area ? escapeHtml(item.area) : `<span class="energy-unassigned">未分配</span>`}</td>
            <td>${item.usageType ? escapeHtml(item.usageType) : `<span class="energy-unassigned">未分配</span>`}</td>
            <td class="action-cell"><button class="action-link" type="button" data-action="energy-assignment-details" data-id="${escapeHtml(item.id)}">详情</button><button class="action-link" type="button" data-action="assign-energy-row" data-id="${escapeHtml(item.id)}">分配</button></td>
          </tr>`).join("")
      : `<tr><td colspan="7"><div class="empty-state"><div><strong>没有匹配的数据</strong>请调整筛选条件</div></div></td></tr>`;

    return `
      <section class="page device-reference-page energy-reference-page energy-assignment-page">
        <div class="page-panel no-padding device-reference-panel energy-reference-panel">
          <div class="device-reference-toolbar energy-reference-toolbar energy-assignment-toolbar">
            <div class="device-reference-filters energy-reference-filters energy-assignment-filters" aria-label="能源分类分配筛选">
              ${renderEnergyAreaPicker({ value: view.filterArea, context: "simple-filter", allowAll: true, compact: true, placeholder: "筛选区域", allLabel: "全部区域" })}
              <label class="reference-search energy-filter-search">${icon("search")}<input type="search" value="${escapeHtml(view.deviceRemark)}" placeholder="设备备注" autocomplete="off" aria-label="设备备注" data-energy-assignment-text-filter></label>
              <select data-energy-assignment-filter="usageType" aria-label="用电类型">${energyFilterOptions([...usageTypes, "未分配"], view.usageType, "全部用电类型")}</select>
            </div>
            <div class="device-reference-actions energy-reference-actions energy-assignment-actions">
              <button class="reference-link-button" type="button" data-action="manage-energy-types">${icon("manage")}用电类型</button>
              <span class="energy-selection-count">已选择 ${view.selected.size} 项</span>
              <button class="reference-export-button" type="button" data-action="open-energy-assignment"${view.selected.size ? "" : " disabled"}>${icon("manage")}批量分配</button>
            </div>
          </div>
          <div class="table-wrap device-reference-table-wrap energy-assignment-table-wrap">
            <table class="data-table energy-assignment-table">
              <colgroup><col style="width:52px"><col style="width:120px"><col style="width:260px"><col style="width:100px"><col style="width:300px"><col style="width:160px"><col style="width:140px"></colgroup>
              <thead><tr><th class="checkbox-cell"><input type="checkbox" aria-label="选择当前页全部回路" data-action="select-all-energy-assignment"${allSelected ? " checked" : ""}${partiallySelected ? ` data-indeterminate="true"` : ""}></th><th>设备类型</th><th>设备备注</th><th>分相</th><th>区域</th><th>用电类型</th><th>操作</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${pagerHtml(filtered.length, view.page, view.pageSize, "energyAssignment")}
        </div>
      </section>`;
  }

  function energyAssignmentDetailItem(rowId) {
    const row = model.energyAssignmentRows.find((item) => item.id === rowId);
    if (!row) return null;
    const device = model.energyDevices.find((item) => item.id === row.deviceId);
    const func = model.energyDeviceFunctions.find((item) => item.id === row.functionId);
    const statistic = model.energyStatistics.find((item) => item.functionId === row.functionId);
    const assigned = Boolean(row.area && row.usageType);
    return {
      ...(statistic ?? {}),
      id: row.id,
      deviceId: row.deviceId,
      functionId: row.functionId,
      deviceRemark: row.deviceRemark,
      deviceType: row.deviceType,
      protocol: device?.protocol ?? statistic?.protocol ?? "—",
      deviceModel: device?.model ?? statistic?.deviceModel ?? "—",
      productName: device?.product ?? statistic?.productName ?? "—",
      sourceType: device?.sourceType ?? statistic?.sourceType ?? "—",
      sourceDevice: device?.deviceName ?? statistic?.sourceDevice ?? "—",
      circuit: func?.circuit ?? statistic?.circuit ?? "—",
      mode: row.deviceType === "电表" ? "分相" : "回路",
      phase: row.phase ?? "—",
      functionName: func?.name ?? statistic?.functionName ?? "—",
      functionType: func?.functionType ?? statistic?.functionType ?? "—",
      navigationArea: device?.navigationArea ?? statistic?.navigationArea ?? "—",
      statisticsArea: row.area || "—",
      usageType: row.usageType || "—",
      currentAmpere: statistic?.currentAmpere ?? null,
      voltage: statistic?.voltage ?? null,
      cumulativeEnergy: statistic?.cumulativeEnergy ?? null,
      periodEnergy: statistic?.periodEnergy ?? null,
      classificationStatus: assigned ? "已分类" : "未分类",
      dataStatus: statistic?.dataStatus ?? (device?.status === "online" ? "待取数" : "数据中断"),
      enabled: assigned,
      effectiveAt: assigned ? (statistic?.effectiveAt && statistic.effectiveAt !== "—" ? statistic.effectiveAt : energyDemoEffectiveAt) : "—",
      detailContext: "energy-assignment",
    };
  }

  function openEnergyAssignmentModal(rowIds = [...state.energyAssignment.selected]) {
    const rows = rowIds.map((id) => model.energyAssignmentRows.find((item) => item.id === id)).filter(Boolean);
    if (!rows.length) {
      showToast("请先选择需要分配的回路", "warning");
      return;
    }
    const commonArea = rows.every((item) => item.area === rows[0].area) ? rows[0].area : "";
    const commonUsageType = rows.every((item) => item.usageType === rows[0].usageType) ? rows[0].usageType : "";
    state.energyAssignment.assignmentDraft = { rowIds: rows.map((item) => item.id), area: commonArea, usageType: commonUsageType };
    const usageTypes = model.energyTypes.filter((item) => item.enabled).map((item) => item.name);
    openModal({
      title: rows.length === 1 ? "分配区域与用电类型" : `批量分配（${rows.length} 项）`,
      body: `
        <div class="energy-assignment-modal-summary"><strong>${escapeHtml(rows[0].deviceRemark)}</strong>${rows.length > 1 ? `<span>等 ${rows.length} 个回路</span>` : `<span>${escapeHtml(rows[0].circuitLabel)}</span>`}</div>
        <div class="energy-assignment-form">
          <div class="form-group"><label class="required">区域</label>${renderEnergyAreaPicker({ value: commonArea, context: "simple-assignment", placeholder: "请选择区域" })}</div>
          <div class="form-group"><label class="required" for="energyAssignmentUsage">用电类型</label><select class="form-control" id="energyAssignmentUsage" data-energy-assignment-usage><option value="">请选择用电类型</option>${usageTypes.map((type) => `<option value="${escapeHtml(type)}"${commonUsageType === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select></div>
        </div>
        <div class="form-error energy-assignment-error" id="energyAssignmentError"></div>`,
      footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button primary" type="button" data-action="save-energy-assignment">保存</button>`,
    });
  }

  function saveEnergyAssignment() {
    const draft = state.energyAssignment.assignmentDraft;
    if (!draft) return;
    const error = document.getElementById("energyAssignmentError");
    if (!draft.area || !draft.usageType) {
      if (error) error.textContent = "请选择区域和用电类型";
      return;
    }
    draft.rowIds.forEach((id) => {
      const row = model.energyAssignmentRows.find((item) => item.id === id);
      if (!row) return;
      row.area = draft.area;
      row.usageType = draft.usageType;
    });
    const updatedCount = draft.rowIds.length;
    state.energyAssignment.selected.clear();
    state.energyAssignment.assignmentDraft = null;
    closeModal();
    render();
    showToast(`已完成 ${updatedCount} 个回路的区域和用电类型分配`, "success");
  }

  function energyDeviceCoverage(device) {
    const functions = model.energyDeviceFunctions.filter((item) => item.deviceId === device.id);
    const items = model.energyStatistics.filter((item) => item.deviceId === device.id);
    const functionIdSet = new Set(functions.map((item) => item.id));
    const existingFunctionIds = [...new Set(items.map((item) => item.functionId).filter((id) => id && functionIdSet.has(id)))];
    const wholeMeterAdded = device.deviceType === "电表" && items.some((item) => item.mode === "整表");
    const complete = device.deviceType === "空开"
      ? items.length > 0
      : wholeMeterAdded || (functions.length > 0 && existingFunctionIds.length === functions.length);
    return {
      device,
      functions,
      items,
      existingFunctionIds,
      wholeMeterAdded,
      complete,
      partial: device.deviceType === "电表" && !wholeMeterAdded && existingFunctionIds.length > 0 && existingFunctionIds.length < functions.length,
      available: functions.length > 0 && !complete,
    };
  }

  function availableEnergyDevices() {
    return model.energyDevices.filter((device) => energyDeviceCoverage(device).available);
  }

  function emptyEnergyDraft() {
    return {
      deviceId: "",
      sourceType: "",
      sourceDevice: "",
      deviceType: "",
      deviceRemark: "",
      navigationArea: "",
      selectedFunctionIds: [],
      lockedFunctionIds: [],
      mode: "整表",
      assignments: {},
    };
  }

  function createEnergyDraft() {
    const draft = emptyEnergyDraft();
    const device = availableEnergyDevices()[0];
    if (device) selectEnergyDraftDevice(draft, device.id);
    return draft;
  }

  function energyDraftDevice(draft) {
    return model.energyDevices.find((item) => item.id === draft.deviceId) ?? null;
  }

  function energyDraftFunctions(draft) {
    return model.energyDeviceFunctions.filter((item) => item.deviceId === draft.deviceId);
  }

  function selectEnergyDraftDevice(draft, deviceId) {
    const device = model.energyDevices.find((item) => item.id === deviceId);
    if (!device) return;
    const coverage = energyDeviceCoverage(device);
    if (!coverage.available) return;
    const functions = coverage.functions;
    Object.assign(draft, {
      deviceId: device.id,
      sourceType: device.sourceType,
      sourceDevice: device.deviceName,
      deviceType: device.deviceType,
      deviceRemark: device.remark,
      navigationArea: device.navigationArea,
      selectedFunctionIds: coverage.partial ? [] : functions.map((item) => item.id),
      lockedFunctionIds: coverage.partial ? [...coverage.existingFunctionIds] : [],
      mode: coverage.partial ? "分相" : device.deviceType === "电表" ? "整表" : "回路",
      assignments: {},
    });
  }

  function energyDraftTargets(draft) {
    const allFunctions = energyDraftFunctions(draft);
    const selectedFunctions = allFunctions.filter((item) => draft.selectedFunctionIds.includes(item.id));
    if (draft.deviceType === "空开") {
      const item = selectedFunctions[0];
      return item ? [{ key: item.id, functionName: item.name, functionType: item.functionType, function: item }] : [];
    }
    if (draft.mode === "整表") return [{ key: "整表", functionName: "全部设备功能", functionType: `${allFunctions.length} 个功能点`, function: null }];
    return selectedFunctions.map((item) => ({ key: item.id, functionName: item.name, functionType: item.functionType, function: item }));
  }

  function ensureEnergyAssignment(draft, target, index = 0) {
    if (!draft.assignments[target]) {
      const defaultArea = draft.navigationArea?.startsWith("2号楼")
        ? "2号楼 / 公共区"
        : draft.navigationArea?.startsWith("园区") ? "园区 / 室外" : "1号楼 / 公共区";
      const functionUsageDefaults = ["照明", "插座", "空调"];
      const usage = target === "整表" ? "动力" : draft.deviceType === "空开" ? "其他" : (functionUsageDefaults[index] ?? "其他");
      draft.assignments[target] = { area: defaultArea, usage };
    }
    return draft.assignments[target];
  }

  function renderEnergyAddStep(draft, step) {
    if (step === 1) {
      const candidates = availableEnergyDevices();
      const rows = candidates.length ? candidates.map((device) => {
        const coverage = energyDeviceCoverage(device);
        return `
        <tr class="energy-device-option${coverage.partial ? " partial" : ""}${draft.deviceId === device.id ? " selected" : ""}" data-action="energy-select-device" data-id="${device.id}" data-coverage="${coverage.partial ? "partial" : "new"}">
          <td class="checkbox-cell"><input type="radio" name="energyDevice"${draft.deviceId === device.id ? " checked" : ""} aria-label="选择 ${escapeHtml(device.remark)}"></td>
          <td>${escapeHtml(device.remark)}</td>
          <td>${escapeHtml(device.deviceType)}</td>
          <td>${escapeHtml(device.protocol)}</td>
          <td title="${escapeHtml(device.model)}">${escapeHtml(device.model)}</td>
          <td title="${escapeHtml(device.product)}">${escapeHtml(device.product)}</td>
        </tr>`;
      }).join("") : `<tr><td colspan="6"><div class="empty-state energy-device-empty"><div><strong>没有可添加的能源设备</strong>已添加整表或全部功能点的设备，请在主列表中编辑修改。</div></div></td></tr>`;
      return `
        <div class="energy-wizard-copy"><h3>选择能源设备</h3></div>
        <div class="table-wrap energy-picker-table-wrap"><table class="data-table energy-picker-table"><colgroup><col style="width:56px"><col style="width:170px"><col style="width:100px"><col style="width:130px"><col style="width:190px"><col style="width:240px"></colgroup><thead><tr><th class="checkbox-cell"></th><th>设备备注</th><th>设备类型</th><th>协议</th><th>型号</th><th>产品名</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    const usageTypes = model.energyTypes.filter((item) => item.enabled).map((item) => item.name);
    const isMeter = draft.deviceType === "电表";
    const device = energyDraftDevice(draft);
    const coverage = device ? energyDeviceCoverage(device) : null;
    const lockedFunctionIds = new Set(draft.lockedFunctionIds ?? []);
    const continuingPartial = isMeter && lockedFunctionIds.size > 0;
    const targets = energyDraftTargets(draft);
    const assignmentRows = isMeter && draft.mode === "分相"
      ? energyDraftFunctions(draft).map((item) => ({
        key: item.id,
        functionName: item.name,
        functionType: item.functionType,
        function: item,
        locked: lockedFunctionIds.has(item.id),
        currentItem: coverage?.items.find((entry) => entry.functionId === item.id) ?? null,
        selected: lockedFunctionIds.has(item.id) || draft.selectedFunctionIds.includes(item.id),
      }))
      : targets.map((target) => ({ ...target, selected: true }));
    const wholeMeterFunctions = isMeter && draft.mode === "整表" ? energyDraftFunctions(draft) : [];
    const wholeMeterAssignment = wholeMeterFunctions.length ? ensureEnergyAssignment(draft, "整表") : null;
    const assignmentMarkup = wholeMeterFunctions.length ? `
      <div class="energy-assignment-list energy-whole-assignment-list">
        <div class="energy-assignment-header whole"><span>功能名称</span><span>功能类型</span><span>统计区域</span><span>用电类型</span></div>
        <div class="energy-whole-assignment">
          <div class="energy-whole-function-list">
            ${wholeMeterFunctions.map((item) => `<div class="energy-whole-function-row"><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><span>${escapeHtml(item.functionType)}</span></div>`).join("")}
          </div>
          <div class="energy-region-field energy-whole-shared-field">${renderEnergyAreaPicker({ value: wholeMeterAssignment.area, context: "assignment", targetKey: "整表" })}</div>
          <label class="energy-whole-shared-field"><select aria-label="整表用电类型" data-energy-assignment="usage" data-target="整表">${usageTypes.map((type) => `<option value="${escapeHtml(type)}"${wholeMeterAssignment.usage === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select></label>
        </div>
      </div>` : `
      <div class="energy-assignment-list">
        <div class="energy-assignment-header"><span></span><span>功能名称</span><span>功能类型</span><span>统计区域</span><span>用电类型</span></div>
        ${assignmentRows.map((target, index) => {
          const assignment = target.locked
            ? { area: target.currentItem?.statisticsArea ?? "—", usage: target.currentItem?.usageType ?? "—" }
            : target.selected ? ensureEnergyAssignment(draft, target.key, index) : null;
          const selector = target.locked
            ? `<span class="energy-edit-scope readonly">已添加</span>`
            : isMeter && draft.mode === "分相" ? `<input class="table-checkbox" type="checkbox" data-action="energy-toggle-function" data-id="${escapeHtml(target.key)}"${target.selected ? " checked" : ""} aria-label="选择功能 ${escapeHtml(target.functionName)}">` : `<span class="energy-assignment-checkbox-spacer"></span>`;
          const areaCell = target.locked
            ? `<span class="energy-edit-readonly" title="${escapeHtml(assignment.area)}">${escapeHtml(assignment.area)}</span>`
            : target.selected ? renderEnergyAreaPicker({ value: assignment.area, context: "assignment", targetKey: target.key }) : `<span class="energy-assignment-unselected">未选择</span>`;
          const usageCell = target.locked
            ? `<span class="energy-edit-readonly">${escapeHtml(assignment.usage)}</span>`
            : target.selected ? `<select aria-label="${escapeHtml(target.functionName)}用电类型" data-energy-assignment="usage" data-target="${escapeHtml(target.key)}">${usageTypes.map((type) => `<option value="${escapeHtml(type)}"${assignment.usage === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select>` : `<span class="energy-assignment-unselected">未选择</span>`;
          return `<div class="energy-assignment-row${target.locked ? " existing readonly" : target.selected ? "" : " unselected"}" data-function-id="${escapeHtml(target.key)}" data-function-state="${target.locked ? "existing" : target.selected ? "selected" : "available"}"><div class="energy-assignment-checkbox">${selector}</div><div class="energy-assignment-function" title="${escapeHtml(target.functionName)}"><strong>${escapeHtml(target.functionName)}</strong></div><div class="energy-assignment-function-type">${escapeHtml(target.functionType)}</div><div class="energy-region-field">${areaCell}</div><label>${usageCell}</label></div>`;
        }).join("")}
      </div>`;
    return `
      <div class="energy-wizard-copy"><h3>${isMeter ? "设置统计方式、区域与用电类型" : "设置统计区域与用电类型"}</h3><p>${isMeter ? "电表可选择整表或分相统计；分相时直接使用设备返回的功能名称和功能类型，不再使用固定相位名称。" : "空开不需要选择统计方式，直接按设备功能点设置统计区域和用电类型。"}</p></div>
      <div class="energy-object-preview"><div><strong>${escapeHtml(device?.remark ?? "—")}</strong><small>${escapeHtml(draft.sourceDevice)} · ${escapeHtml(device?.product ?? "—")}</small></div></div>
      ${isMeter ? `<div class="energy-mode-switch">
        <button type="button" class="${draft.mode === "整表" ? "active" : ""}" data-action="energy-select-mode" data-mode="整表"${continuingPartial ? " disabled" : ""}><strong>整表统计</strong><small>${continuingPartial ? "该设备已有分相统计项，如需改为整表请在主列表中编辑" : "全部设备功能共用同一统计区域和用电类型，保存后生成一行"}</small></button>
        <button type="button" class="${draft.mode === "分相" ? "active" : ""}" data-action="energy-select-mode" data-mode="分相"><strong>分相统计</strong><small>勾选参与统计的设备功能点，分别设置区域和用电类型，按功能点生成多行</small></button>
      </div>` : ""}
      ${continuingPartial ? `<div class="energy-edit-scope-note energy-add-scope-note">该设备已添加 ${lockedFunctionIds.size}/${energyDraftFunctions(draft).length} 个功能点；已添加项仅供查看，本次只需勾选并配置剩余功能点。</div>` : ""}
      ${assignmentMarkup}`;
  }

  function openEnergyAddModal(reset = false) {
    const view = state.energyClassification;
    if (reset || !view.draft) {
      view.draft = createEnergyDraft();
      view.addStep = 1;
    }
    const labels = ["选择设备", "区域与类型"];
    const canAdvance = Boolean(view.draft.deviceId && availableEnergyDevices().some((device) => device.id === view.draft.deviceId));
    const canSave = canAdvance && energyDraftTargets(view.draft).length > 0;
    const primaryDisabled = view.addStep === 2 ? !canSave : !canAdvance;
    openModal({
      title: "添加能源设备",
      xlarge: true,
      body: `<div class="energy-stepper">${labels.map((label, index) => `<div class="${view.addStep === index + 1 ? "active" : view.addStep > index + 1 ? "done" : ""}"><i>${view.addStep > index + 1 ? "✓" : index + 1}</i><span>${label}</span></div>`).join("")}</div><div class="energy-wizard-body">${renderEnergyAddStep(view.draft, view.addStep)}</div>`,
      footer: `<button class="button" type="button" data-action="close-modal">取消</button>${view.addStep > 1 ? `<button class="button" type="button" data-action="energy-step-prev">上一步</button>` : ""}<button class="button primary" type="button" data-action="${view.addStep === 2 ? "save-energy-statistics" : "energy-step-next"}"${primaryDisabled ? " disabled" : ""}>${view.addStep === 2 ? `${icon("save")}保存并生效` : "下一步"}</button>`,
    });
  }

  function nextEnergyStatisticIndex() {
    const numbers = model.energyStatistics
      .map((item) => String(item.id).match(/^energy-(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    return (numbers.length ? Math.max(...numbers) : 0) + 1;
  }

  function saveEnergyStatistics() {
    const view = state.energyClassification;
    const draft = view.draft;
    const device = energyDraftDevice(draft);
    if (!device) {
      showToast("请选择可添加的能源设备", "warning");
      return;
    }
    const coverage = energyDeviceCoverage(device);
    if (!coverage.available) {
      showToast("该设备已完整添加，请在主列表中编辑修改", "warning");
      return;
    }
    const targets = energyDraftTargets(draft);
    if (!targets.length) {
      showToast(coverage.partial ? "请至少选择一个尚未添加的设备功能" : "请至少选择一个用于能耗统计的设备功能", "warning");
      return;
    }
    if (draft.mode === "整表" && coverage.items.length) {
      showToast("该设备已有分相统计项，如需改为整表请在主列表中编辑", "warning");
      return;
    }
    const duplicateTarget = targets.find((target) => target.function?.id && coverage.existingFunctionIds.includes(target.function.id));
    if (duplicateTarget) {
      showToast(`功能“${duplicateTarget.functionName}”已添加，请勿重复保存`, "warning");
      return;
    }
    const functionCount = energyDraftFunctions(draft).length;
    const finalFunctionCount = new Set([...coverage.existingFunctionIds, ...targets.map((target) => target.function?.id).filter(Boolean)]).size;
    const isPartialFunctionSelection = draft.mode === "分相" && finalFunctionCount < functionCount;
    const startIndex = nextEnergyStatisticIndex();
    if (coverage.partial && coverage.items.length) {
      recordEnergyHistory(coverage.items[0], energyDemoEffectiveAt, `继续添加 ${targets.length} 个功能点`);
      coverage.items.forEach((item) => {
        item.effectiveAt = energyDemoEffectiveAt;
        item.periodEnergy = 0;
      });
    }
    targets.forEach((target, index) => {
      const assignment = ensureEnergyAssignment(draft, target.key, index);
      const isBreaker = draft.deviceType === "空开";
      model.energyStatistics.unshift({
        id: `energy-${String(startIndex + index).padStart(3, "0")}`,
        deviceId: draft.deviceId,
        functionId: target.function?.id ?? null,
        name: draft.mode === "整表" ? `${draft.deviceRemark} 整表` : `${draft.deviceRemark} ${target.functionName}`,
        deviceRemark: device?.remark ?? draft.deviceRemark,
        deviceType: device?.deviceType ?? draft.deviceType,
        protocol: device?.protocol ?? "—",
        deviceModel: device?.model ?? "—",
        productName: device?.product ?? "—",
        sourceType: draft.sourceType,
        sourceDevice: draft.sourceDevice,
        circuit: draft.mode === "整表" ? "全部设备功能" : (target.function?.circuit ?? target.functionName),
        mode: isBreaker ? "回路" : draft.mode,
        phase: "—",
        functionName: target.functionName,
        functionType: target.functionType,
        navigationArea: device?.navigationArea ?? "—",
        statisticsArea: assignment.area,
        usageType: assignment.usage,
        currentAmpere: null,
        voltage: null,
        cumulativeEnergy: null,
        periodEnergy: null,
        classificationStatus: isPartialFunctionSelection ? "部分分类" : "已分类",
        dataStatus: "待取数",
        enabled: true,
        effectiveAt: energyDemoEffectiveAt,
      });
    });
    const updatedCoverage = energyDeviceCoverage(device);
    updatedCoverage.items.forEach((item) => {
      item.classificationStatus = updatedCoverage.complete ? "已分类" : "部分分类";
    });
    view.draft = null;
    view.page = 1;
    closeModal();
    render();
    showToast(`${coverage.partial ? "已继续添加" : "已生成"} ${targets.length} 个能源统计项`, "success");
  }

  const energyDemoEffectiveAt = "2026-10-30 14:00";

  function energySourceKey(item) {
    return item.deviceId || item.sourceDevice || item.deviceRemark || item.id;
  }

  function energyDeviceForItem(item) {
    return model.energyDevices.find((device) => device.id === item.deviceId)
      ?? model.energyDevices.find((device) => device.remark === item.deviceRemark)
      ?? null;
  }

  function energyFunctionsForItem(item) {
    const device = energyDeviceForItem(item);
    return device ? model.energyDeviceFunctions.filter((entry) => entry.deviceId === device.id) : [];
  }

  function energyGroupItems(item) {
    const sourceKey = energySourceKey(item);
    return model.energyStatistics.filter((entry) => entry.deviceType === "电表" && energySourceKey(entry) === sourceKey);
  }

  function findEnergyFunctionItem(groupItems, func) {
    return groupItems.find((entry) => entry.functionId === func.id)
      ?? groupItems.find((entry) => entry.functionName === func.name)
      ?? null;
  }

  function createEnergyEditDraft(item) {
    const device = energyDeviceForItem(item);
    const functions = energyFunctionsForItem(item);
    const groupItems = energyGroupItems(item);
    const editedFunction = functions.find((entry) => entry.id === item.functionId)
      ?? functions.find((entry) => entry.name === item.functionName)
      ?? null;
    const assignments = {
      "整表": { area: item.statisticsArea, usage: item.usageType },
    };
    functions.forEach((func) => {
      const current = findEnergyFunctionItem(groupItems, func);
      assignments[func.id] = {
        area: current?.statisticsArea ?? item.statisticsArea,
        usage: current?.usageType ?? item.usageType,
      };
    });
    return {
      itemId: item.id,
      deviceId: device?.id ?? item.deviceId ?? "",
      sourceKey: energySourceKey(item),
      originMode: item.mode,
      mode: item.mode,
      editedFunctionId: editedFunction?.id ?? item.functionId ?? "",
      assignments,
    };
  }

  function renderEnergyEditContent(item, draft) {
    const device = energyDeviceForItem(item);
    const functions = energyFunctionsForItem(item);
    const groupItems = energyGroupItems(item);
    const visibleSplitFunctions = draft.originMode === "整表"
      ? functions
      : functions.filter((func) => Boolean(findEnergyFunctionItem(groupItems, func)));
    const usageTypes = model.energyTypes.filter((entry) => entry.enabled).map((entry) => entry.name);
    const options = (selected) => usageTypes.map((type) => `<option value="${escapeHtml(type)}"${selected === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("");
    let assignmentMarkup = "";

    if (draft.mode === "整表") {
      const assignment = draft.assignments["整表"];
      assignmentMarkup = `
        <div class="energy-assignment-list energy-whole-assignment-list">
          <div class="energy-assignment-header whole"><span>功能名称</span><span>功能类型</span><span>统计区域</span><span>用电类型</span></div>
          <div class="energy-whole-assignment">
            <div class="energy-whole-function-list">
              ${functions.map((func) => `<div class="energy-whole-function-row"><strong title="${escapeHtml(func.name)}">${escapeHtml(func.name)}</strong><span>${escapeHtml(func.functionType)}</span></div>`).join("")}
            </div>
            <div class="energy-region-field energy-whole-shared-field">${renderEnergyAreaPicker({ value: assignment.area, context: "edit-assignment", targetKey: "整表" })}</div>
            <label class="energy-whole-shared-field"><select aria-label="整表用电类型" data-energy-edit-assignment="usage" data-target="整表">${options(assignment.usage)}</select></label>
          </div>
        </div>`;
    } else {
      const allEditable = draft.originMode === "整表";
      assignmentMarkup = `
        <div class="energy-edit-scope-note">${allEditable ? "整表改为分相后，三个设备功能分别生成统计记录，可分别设置区域和用电类型。" : "当前分相可以修改；同一电表其他已添加功能点仅供查看，未添加功能点不在编辑中显示。"}</div>
        <div class="energy-assignment-list energy-edit-assignment-list">
          <div class="energy-assignment-header"><span></span><span>功能名称</span><span>功能类型</span><span>统计区域</span><span>用电类型</span></div>
          ${visibleSplitFunctions.map((func) => {
            const assignment = draft.assignments[func.id];
            const editable = allEditable || func.id === draft.editedFunctionId;
            const scopeLabel = editable ? "可编辑" : "仅查看";
            const areaCell = editable
              ? renderEnergyAreaPicker({ value: assignment.area, context: "edit-assignment", targetKey: func.id })
              : `<span class="energy-edit-readonly" title="${escapeHtml(assignment.area)}">${escapeHtml(assignment.area)}</span>`;
            const usageCell = editable
              ? `<select aria-label="${escapeHtml(func.name)}用电类型" data-energy-edit-assignment="usage" data-target="${escapeHtml(func.id)}">${options(assignment.usage)}</select>`
              : `<span class="energy-edit-readonly">${escapeHtml(assignment.usage)}</span>`;
            return `<div class="energy-assignment-row${editable ? "" : " readonly"}"><div class="energy-edit-scope ${editable ? "editable" : "readonly"}">${scopeLabel}</div><div class="energy-assignment-function" title="${escapeHtml(func.name)}"><strong>${escapeHtml(func.name)}</strong></div><div class="energy-assignment-function-type">${escapeHtml(func.functionType)}</div><div class="energy-region-field">${areaCell}</div><label>${usageCell}</label></div>`;
          }).join("")}
        </div>`;
    }

    return `
      <div class="energy-object-preview"><div><strong>${escapeHtml(device?.remark ?? item.deviceRemark)}</strong><small>${escapeHtml(item.sourceDevice)} · ${escapeHtml(device?.product ?? item.productName ?? "—")}</small></div></div>
      <div class="energy-mode-switch energy-edit-mode-switch">
        <button type="button" class="${draft.mode === "整表" ? "active" : ""}" data-action="energy-edit-select-mode" data-mode="整表"><strong>整表统计</strong><small>全部设备功能共用一组统计区域和用电类型，保存后列表显示一行</small></button>
        <button type="button" class="${draft.mode === "分相" ? "active" : ""}" data-action="energy-edit-select-mode" data-mode="分相"><strong>分相统计</strong><small>设备功能分别设置区域和用电类型，保存后按功能点显示多行</small></button>
      </div>
      ${assignmentMarkup}`;
  }

  function recordEnergyHistory(item, effectiveTo, change) {
    const historyItems = item.deviceType === "电表" ? energyGroupItems(item) : [item];
    const uniqueValues = (field) => [...new Set(historyItems.map((entry) => entry[field]).filter((value) => value && value !== "—"))];
    const modes = uniqueValues("mode");
    const areas = uniqueValues("statisticsArea");
    const usageTypes = uniqueValues("usageType");
    const effectiveStarts = historyItems.map((entry) => entry.effectiveAt).filter((value) => value && value !== "—").sort();
    const periodEnergy = sumEnergyValues(historyItems, "cumulativeEnergy");
    model.energyClassificationHistory.push({
      id: `energy-history-${model.energyClassificationHistory.length + 1}`,
      sourceKey: energySourceKey(item),
      deviceRemark: item.deviceRemark,
      sourceDevice: item.sourceDevice,
      deviceModel: item.deviceModel,
      mode: modes.length === 1 ? modes[0] : modes.join("、"),
      functionName: item.deviceType === "电表" && modes.includes("分相") ? `${historyItems.length} 个功能点` : item.functionName,
      functionType: item.deviceType === "电表" && modes.includes("分相") ? "设备功能汇总" : item.functionType,
      statisticsArea: areas.length > 1 ? `多区域（${areas.length} 项）` : (areas[0] ?? "—"),
      usageType: usageTypes.length > 1 ? usageTypes.join("、") : (usageTypes[0] ?? "—"),
      effectiveFrom: effectiveStarts.at(-1) ?? item.effectiveAt,
      effectiveTo,
      periodEnergy,
      change,
    });
  }

  function splitEnergyValue(total, count, index) {
    if (!Number.isFinite(total) || !count) return null;
    const base = Math.round((total / count) * 10) / 10;
    if (index < count - 1) return base;
    return Math.round((total - base * (count - 1)) * 10) / 10;
  }

  function sumEnergyValues(items, field) {
    const values = items.map((entry) => entry[field]).filter(Number.isFinite);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) * 10) / 10 : null;
  }

  function averageEnergyValues(items, field) {
    const values = items.map((entry) => entry[field]).filter(Number.isFinite);
    return values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null;
  }

  function replaceEnergyGroup(groupItems, replacements) {
    const indexes = groupItems.map((entry) => model.energyStatistics.indexOf(entry)).filter((index) => index >= 0);
    const insertAt = indexes.length ? Math.min(...indexes) : 0;
    model.energyStatistics = model.energyStatistics.filter((entry) => !groupItems.includes(entry));
    model.energyStatistics.splice(insertAt, 0, ...replacements);
  }

  function saveEnergyMeterEdit(id) {
    const item = model.energyStatistics.find((entry) => entry.id === id);
    const draft = state.energyClassification.editDraft;
    if (!item || !draft) return;
    const device = energyDeviceForItem(item);
    const functions = energyFunctionsForItem(item);
    const groupItems = energyGroupItems(item);

    if (draft.originMode === "分相" && draft.mode === "整表") {
      recordEnergyHistory(item, energyDemoEffectiveAt, "分相改为整表");
      const assignment = draft.assignments["整表"];
      const wholeItem = {
        ...item,
        deviceId: device?.id ?? item.deviceId,
        functionId: null,
        name: `${item.deviceRemark} 整表`,
        circuit: "全部设备功能",
        mode: "整表",
        functionName: "全部设备功能",
        functionType: `${functions.length} 个功能点`,
        statisticsArea: assignment.area,
        usageType: assignment.usage,
        currentAmpere: sumEnergyValues(groupItems, "currentAmpere"),
        voltage: averageEnergyValues(groupItems, "voltage"),
        cumulativeEnergy: sumEnergyValues(groupItems, "cumulativeEnergy"),
        periodEnergy: 0,
        classificationStatus: "已分类",
        dataStatus: groupItems.some((entry) => entry.dataStatus !== "正常") ? "部分异常" : "正常",
        enabled: groupItems.some((entry) => entry.enabled),
        effectiveAt: energyDemoEffectiveAt,
      };
      replaceEnergyGroup(groupItems, [wholeItem]);
    } else if (draft.originMode === "整表" && draft.mode === "分相") {
      recordEnergyHistory(item, energyDemoEffectiveAt, "整表改为分相");
      const splitItems = functions.map((func, index) => {
        const assignment = draft.assignments[func.id];
        return {
          ...item,
          id: index === 0 ? item.id : `${item.id}-part-${index + 1}`,
          deviceId: device?.id ?? item.deviceId,
          functionId: func.id,
          name: `${item.deviceRemark} ${func.name}`,
          circuit: func.circuit,
          mode: "分相",
          functionName: func.name,
          functionType: func.functionType,
          statisticsArea: assignment.area,
          usageType: assignment.usage,
          currentAmpere: splitEnergyValue(item.currentAmpere, functions.length, index),
          voltage: Number.isFinite(item.voltage) && item.voltage > 300 ? Math.round((item.voltage / Math.sqrt(3)) * 10) / 10 : item.voltage,
          cumulativeEnergy: splitEnergyValue(item.cumulativeEnergy, functions.length, index),
          periodEnergy: 0,
          classificationStatus: "已分类",
          effectiveAt: energyDemoEffectiveAt,
        };
      });
      replaceEnergyGroup(groupItems, splitItems);
    } else {
      const targetKey = item.mode === "整表" ? "整表" : draft.editedFunctionId;
      const assignment = draft.assignments[targetKey];
      const areaChanged = item.statisticsArea !== assignment.area;
      const typeChanged = item.usageType !== assignment.usage;
      if (!areaChanged && !typeChanged) {
        closeModal();
        showToast("未检测到分类变化", "info");
        return;
      }
      const changes = [areaChanged ? "统计区域" : "", typeChanged ? "用电类型" : ""].filter(Boolean).join("、");
      recordEnergyHistory(item, energyDemoEffectiveAt, `修改${changes}`);
      item.statisticsArea = assignment.area;
      item.usageType = assignment.usage;
      item.periodEnergy = 0;
      item.classificationStatus = "已分类";
      item.effectiveAt = energyDemoEffectiveAt;
    }

    state.energyClassification.editDraft = null;
    closeModal();
    state.energyClassification.page = 1;
    render();
    showToast(`分类已更新：${draft.originMode} → ${draft.mode}；历史区间能耗已保留`, "success");
  }

  function energyHistoryRows(item) {
    const sourceKey = energySourceKey(item);
    const closedRows = model.energyClassificationHistory.filter((entry) => entry.sourceKey === sourceKey);
    return closedRows.sort((left, right) => String(right.effectiveFrom).localeCompare(String(left.effectiveFrom), "zh-CN"));
  }

  function energyDetailField(item) {
    const usesPhase = item.detailContext === "energy-assignment";
    return {
      simplified: usesPhase,
      label: usesPhase ? "分相" : "功能名称",
      value: usesPhase ? (item.phase || "—") : (item.functionName || "—"),
    };
  }

  function renderCurrentEnergyAssignment(item) {
    const effective = item.effectiveAt && item.effectiveAt !== "—";
    const energyValue = Number.isFinite(item.cumulativeEnergy) ? `${energyMeasurement(item.cumulativeEnergy)} kW·h` : "--";
    const currentValue = Number.isFinite(item.currentAmpere) ? `${energyMeasurement(item.currentAmpere)} A` : "--";
    const voltageValue = Number.isFinite(item.voltage) ? `${energyMeasurement(item.voltage)} V` : "--";
    const detailField = energyDetailField(item);
    const currentScopeCopy = detailField.simplified ? "以下区域、用电类型为当前统计口径。" : "以下区域、用电类型及统计方式为当前统计口径。";
    return `
      <section class="energy-current-card">
        <header>
          <div><span class="energy-current-status${effective ? "" : " inactive"}">${effective ? "当前生效" : "尚未生效"}</span><h3>当前能耗归属</h3><p>${currentScopeCopy}</p></div>
          <div class="energy-current-live-metrics"><div><span>电流</span><strong>${currentValue}</strong></div><div><span>电压</span><strong>${voltageValue}</strong></div></div>
          <div class="energy-current-total"><span>累计能耗</span><strong>${energyValue}</strong></div>
        </header>
        <div class="energy-current-grid${detailField.simplified ? " simplified" : ""}">
          ${detailField.simplified ? "" : `<div><span>统计模式</span><strong>${escapeHtml(item.mode)}</strong></div>`}
          <div><span>${detailField.label}</span><strong>${escapeHtml(detailField.value)}</strong></div>
          <div><span>统计区域</span><strong>${escapeHtml(item.statisticsArea || "—")}</strong></div>
          <div><span>用电类型</span><strong>${escapeHtml(item.usageType || "—")}</strong></div>
          <div class="wide"><span>生效区间</span><strong>${effective ? `${escapeHtml(item.effectiveAt)} 至今` : "—"}</strong></div>
        </div>
      </section>`;
  }

  function renderEnergyHistory(item) {
    const rows = energyHistoryRows(item);
    return `
      <section class="energy-history-section">
        <div class="energy-history-heading"><div><h3>历史能耗</h3></div><span>${rows.length} 条</span></div>
        ${item.deviceType === "电表" ? `<div class="energy-history-scope-note"><strong>统计口径</strong><span>每条记录汇总设备在一个生效区间内产生的能耗。分相模式合计该设备各功能点的区间能耗，整表模式记录设备整表的区间能耗；区域、用电类型或统计模式变更时结束当前区间并生成新记录，已结束区间不按新配置回算。</span></div>` : ""}
        <div class="table-wrap energy-history-table-wrap"><table class="data-table energy-history-table">
          <thead><tr><th>生效区间</th><th>来源快照</th><th>统计模式</th><th>统计区域</th><th>用电类型</th><th>设备区间能耗(kW·h)</th></tr></thead>
          <tbody>${rows.map((entry) => `<tr><td><strong>${escapeHtml(entry.effectiveFrom)}</strong><span>至 ${escapeHtml(entry.effectiveTo)}</span></td><td><strong>${escapeHtml(entry.deviceRemark)}</strong><span>${escapeHtml(entry.functionName)} · ${escapeHtml(entry.deviceModel || "—")}</span></td><td>${escapeHtml(entry.mode)}</td><td>${escapeHtml(entry.statisticsArea)}</td><td>${escapeHtml(entry.usageType)}</td><td>${energyMeasurement(entry.periodEnergy)}</td></tr>`).join("")}</tbody>
        </table></div>
        <div class="energy-history-footnote">Demo 的设备区间能耗为脱敏 Mock 快照；正式实现应按设备及分类版本的起止时间计算区间内的实际增量能耗。</div>
      </section>`;
  }

  function energyDetailAnalysis(item) {
    const analytics = model.energyDetailAnalytics?.[item.id]
      ?? model.energyDetailAnalytics?.[energySourceKey(item)]
      ?? model.energyDetailAnalytics?.default
      ?? null;
    if (!analytics) return null;
    const groupItems = energyGroupItems(item).filter((entry) => Number.isFinite(entry.cumulativeEnergy));
    const groupEnergy = groupItems.reduce((total, entry) => total + entry.cumulativeEnergy, 0);
    const factor = item.mode === "分相" && groupItems.length > 1 && groupEnergy > 0 && Number.isFinite(item.cumulativeEnergy)
      ? item.cumulativeEnergy / groupEnergy
      : 1;
    return {
      ...analytics,
      summary: {
        ...analytics.summary,
        monthEnergy: analytics.summary.monthEnergy * factor,
        dailyAverage: analytics.summary.dailyAverage * factor,
      },
      series: Object.fromEntries(Object.entries(analytics.series).map(([key, points]) => [key, points.map((point) => ({ ...point, value: point.value * factor }))])),
    };
  }

  function energyTrendSvg(points) {
    const width = 760;
    const height = 236;
    const plot = { left: 48, right: 20, top: 22, bottom: 42 };
    const plotWidth = width - plot.left - plot.right;
    const plotHeight = height - plot.top - plot.bottom;
    const values = points.map((point) => Number(point.value) || 0);
    const rawMax = Math.max(...values, 1);
    const maxValue = Math.ceil(rawMax * 1.2 * 10) / 10;
    const xAt = (index) => plot.left + (points.length > 1 ? (plotWidth * index) / (points.length - 1) : plotWidth / 2);
    const yAt = (value) => plot.top + plotHeight - (value / maxValue) * plotHeight;
    const coordinates = points.map((point, index) => ({ ...point, x: xAt(index), y: yAt(Number(point.value) || 0) }));
    const linePoints = coordinates.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    const areaPath = coordinates.length ? `M ${coordinates[0].x.toFixed(1)} ${(plot.top + plotHeight).toFixed(1)} L ${linePoints.replaceAll(" ", " L ")} L ${coordinates.at(-1).x.toFixed(1)} ${(plot.top + plotHeight).toFixed(1)} Z` : "";
    const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = plot.top + plotHeight * ratio;
      const value = maxValue * (1 - ratio);
      return `<line x1="${plot.left}" y1="${y}" x2="${width - plot.right}" y2="${y}" class="energy-trend-grid-line"/><text x="${plot.left - 9}" y="${y + 4}" text-anchor="end" class="energy-trend-y-label">${value.toFixed(value >= 10 ? 0 : 1)}</text>`;
    }).join("");
    const labelStep = Math.max(1, Math.ceil(points.length / 6));
    const labels = coordinates.map((point, index) => (index % labelStep === 0 || index === coordinates.length - 1 ? `<text x="${point.x}" y="${height - 13}" text-anchor="middle" class="energy-trend-x-label">${escapeHtml(point.label)}</text>` : "")).join("");
    const dots = coordinates.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="${index === coordinates.length - 1 ? 4.5 : 3}" class="energy-trend-dot${index === coordinates.length - 1 ? " latest" : ""}"><title>${escapeHtml(point.label)}：${energyMeasurement(Number(point.value))} kW·h</title></circle>`).join("");
    const latest = coordinates.at(-1);
    const latestMarker = latest ? `<g class="energy-trend-latest"><rect x="${Math.min(width - 104, Math.max(plot.left, latest.x - 42))}" y="${Math.max(4, latest.y - 38)}" width="84" height="26" rx="5"></rect><text x="${Math.min(width - 62, Math.max(plot.left + 42, latest.x))}" y="${Math.max(21, latest.y - 21)}" text-anchor="middle">${energyMeasurement(Number(latest.value))} kW·h</text></g>` : "";
    return `<svg class="energy-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="能耗变化时间轴"><defs><linearGradient id="energyTrendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#8b45e6" stop-opacity="0.28"></stop><stop offset="100%" stop-color="#8b45e6" stop-opacity="0.02"></stop></linearGradient></defs>${grid}<path d="${areaPath}" fill="url(#energyTrendFill)"></path><polyline points="${linePoints}" class="energy-trend-line"></polyline>${dots}${labels}${latestMarker}</svg>`;
  }

  function renderEnergyAnalysis(item) {
    const analytics = energyDetailAnalysis(item);
    if (!analytics) return "";
    const summary = analytics.summary;
    const range = state.energyClassification.detailRange;
    const points = analytics.series[range] ?? analytics.series["30d"] ?? [];
    const rangeCopy = { "7d": "近 7 天", "30d": "近 30 天", "12m": "近 12 个月" };
    const assignment = `${item.statisticsArea || "—"} · ${item.usageType || "—"}`;
    const effectiveRange = item.effectiveAt && item.effectiveAt !== "—" ? `${item.effectiveAt} 至今` : "尚未生效";
    const metrics = [
      { label: "本月用电", value: `${energyMeasurement(summary.monthEnergy)} kW·h`, note: `当前生效归属：${assignment}`, tone: "purple" },
      { label: "日均用电", value: `${energyMeasurement(summary.dailyAverage, 2)} kW·h`, note: `生效区间：${effectiveRange}`, tone: "blue" },
    ];
    return `
      <section class="energy-analysis-section">
        <div class="energy-metric-grid">${metrics.map((metric) => `<article class="energy-metric-card ${metric.tone}"><i></i><span>${metric.label}</span><strong>${metric.value}</strong><small>${metric.note}</small></article>`).join("")}</div>
        <div class="energy-analysis-layout">
          <article class="energy-analysis-card energy-trend-card">
            <header><div><h4>能耗变化时间轴</h4><p>${rangeCopy[range] ?? "近 30 天"}统计项用电变化，横轴为时间，纵轴为区间用电量（kW·h）</p></div><div class="energy-range-switch" role="group" aria-label="能耗趋势时间范围">${["7d", "30d", "12m"].map((value) => `<button type="button" class="${range === value ? "active" : ""}" data-action="energy-detail-range" data-range="${value}" data-id="${escapeHtml(item.id)}">${rangeCopy[value]}</button>`).join("")}</div></header>
            <div class="energy-trend-chart">${energyTrendSvg(points)}</div>
          </article>
        </div>
      </section>`;
  }

  function openEnergyDetails(id) {
    const item = model.energyStatistics.find((entry) => entry.id === id) ?? energyAssignmentDetailItem(id);
    if (!item) return;
    const detailField = energyDetailField(item);
    openModal({
      title: "能源统计项详情",
      xlarge: true,
      body: `<div class="energy-detail-identity${detailField.simplified ? " simplified" : ""}"><div><span>设备备注</span><strong>${escapeHtml(item.deviceRemark)}</strong></div>${detailField.simplified ? "" : `<div><span>设备类型</span><strong>${escapeHtml(item.deviceType)}</strong></div>`}<div><span>${detailField.label}</span><strong>${escapeHtml(detailField.value)}</strong></div></div>${renderCurrentEnergyAssignment(item)}${renderEnergyAnalysis(item)}${renderEnergyHistory(item)}`,
      footer: `<button class="button primary" type="button" data-action="close-modal">关闭</button>`,
    });
  }

  function openEnergyEdit(id, reset = true) {
    const item = model.energyStatistics.find((entry) => entry.id === id);
    if (!item) return;
    const functions = energyFunctionsForItem(item);
    if (item.deviceType === "电表" && functions.length) {
      if (reset || !state.energyClassification.editDraft || state.energyClassification.editDraft.itemId !== id) {
        state.energyClassification.editDraft = createEnergyEditDraft(item);
      }
      const draft = state.energyClassification.editDraft;
      openModal({
        title: "编辑能源统计分类",
        xlarge: true,
        body: renderEnergyEditContent(item, draft),
        footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button primary" type="button" data-action="save-energy-meter-edit" data-id="${item.id}">${icon("save")}保存并生效</button>`,
      });
      return;
    }
    const types = model.energyTypes.filter((entry) => entry.enabled).map((entry) => entry.name);
    openModal({
      title: "编辑能源统计分类",
      large: true,
      body: `<div class="energy-edit-source"><span>来源对象</span><strong>${escapeHtml(item.deviceRemark)} / ${escapeHtml(item.functionName)} / ${escapeHtml(item.functionType)}</strong></div><div class="energy-edit-grid"><div class="energy-region-field"><span>统计区域</span>${renderEnergyAreaPicker({ value: item.statisticsArea, context: "edit" })}<input id="energyEditArea" type="hidden" value="${escapeHtml(item.statisticsArea)}"></div><label><span>用电类型</span><select id="energyEditUsage">${types.map((type) => `<option value="${escapeHtml(type)}"${item.usageType === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}</select></label></div>`,
      footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button primary" type="button" data-action="save-energy-edit" data-id="${item.id}">${icon("save")}保存</button>`,
    });
  }

  function openEnergyTypeManager() {
    const referencedTypes = new Set([
      ...model.energyStatistics.map((item) => item.usageType),
      ...model.energyAssignmentRows.map((item) => item.usageType),
      ...(model.energyClassificationHistory ?? []).map((item) => item.usageType),
    ]);
    openModal({
      title: "用电类型管理",
      large: true,
      body: `<div class="energy-type-toolbar"><label><span>新增自定义类型</span><input id="newEnergyTypeName" maxlength="12" placeholder="例如：充电桩" /></label><button class="button primary" type="button" data-action="add-energy-type">${icon("plus")}添加</button></div><div class="energy-type-list">${model.energyTypes.map((type) => {
        const referenced = referencedTypes.has(type.name);
        return `<div class="energy-type-row"><span class="energy-type-name"><strong>${escapeHtml(type.name)}</strong><small>${type.builtIn ? "系统预置" : "自定义"}</small></span><em>${referenced ? "引用中，不可删除" : "未引用"}</em><button class="energy-type-switch${type.enabled ? " active" : ""}" type="button" role="switch" aria-checked="${type.enabled}" aria-label="${escapeHtml(type.name)}当前已${type.enabled ? "启用" : "禁用"}，点击${type.enabled ? "禁用" : "启用"}" data-action="toggle-energy-type" data-id="${escapeHtml(type.id)}" title="点击${type.enabled ? "禁用" : "启用"}"></button><span class="energy-type-actions"><button class="action-link" type="button" data-action="edit-energy-type" data-id="${escapeHtml(type.id)}">编辑</button><button class="action-link danger" type="button" data-action="delete-energy-type" data-id="${escapeHtml(type.id)}"${referenced ? ` disabled title="引用中的用电类型不可删除"` : ""}>删除</button></span></div>`;
      }).join("")}</div><div class="energy-pending-note">类型使用稳定标识。已被统计项引用的类型不能直接删除，应先迁移统计项或禁用类型。</div>`,
    });
  }

  function openEnergyTypeEdit(id) {
    const type = model.energyTypes.find((item) => item.id === id);
    if (!type) return;
    openModal({
      title: "编辑用电类型",
      body: `<label class="energy-type-edit-field"><span>类型名称</span><input id="energyTypeEditName" maxlength="12" value="${escapeHtml(type.name)}" autocomplete="off" /></label>`,
      footer: `<button class="button" type="button" data-action="manage-energy-types">取消</button><button class="button primary" type="button" data-action="save-energy-type" data-id="${escapeHtml(type.id)}">保存</button>`,
    });
  }

  function openEnergyTypeDelete(id) {
    const type = model.energyTypes.find((item) => item.id === id);
    if (!type) return;
    const referenced = model.energyStatistics.some((item) => item.usageType === type.name)
      || model.energyAssignmentRows.some((item) => item.usageType === type.name)
      || (model.energyClassificationHistory ?? []).some((item) => item.usageType === type.name);
    if (referenced) {
      showToast(`“${type.name}”正在被引用，不能删除`, "warning");
      return;
    }
    openModal({
      title: "删除用电类型",
      body: `<div class="confirm-message">确定删除用电类型“${escapeHtml(type.name)}”吗？删除后不再出现在分类选项中。</div>`,
      footer: `<button class="button" type="button" data-action="manage-energy-types">取消</button><button class="button danger" type="button" data-action="confirm-delete-energy-type" data-id="${escapeHtml(type.id)}">删除</button>`,
    });
  }

  function renderPlaceholderPage(page) {
    return `
      <section class="placeholder-page">
        <div><strong>${escapeHtml(pageNames[page] ?? "页面")}</strong>本次 Demo 只实现导航、配电箱设备查询、设备管理只读配电箱信息和历史记录。</div>
      </section>`;
  }

  function openModal({ title, body, footer = "", large = false, xlarge = false }) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal-backdrop">
        <section class="modal-dialog${large ? " large" : ""}${xlarge ? " xlarge" : ""}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <header class="modal-header"><h2 id="modalTitle">${escapeHtml(title)}</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">${icon("close")}</button></header>
          <div class="modal-body">${body}</div>
          ${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}
        </section>
      </div>`;
    requestAnimationFrame(() => modalRoot.querySelector("input, select, button")?.focus());
  }

  function closeModal() {
    modalRoot.innerHTML = "";
  }

  function showRules() {
    openModal({
      title: "Demo 规则与评审假设",
      large: true,
      body: `
        <ol class="rules-list">
          <li><strong>本次首页 Demo：</strong>按用户提供的页面截图保留设备总数、功能总数、功能占比和欢迎区，并用“用电概览、当月电力消耗分布、用电量变化趋势”替换原五个状态仪表。</li>
          <li><strong>演示假设：</strong>首页能耗数值为脱敏 Mock 数据；统计月份切换、环比、同比和折线节点悬停仅用于评审信息结构与交互，不代表真实接口已经接入。</li>
          <li><strong>已确认：</strong>导航只保留组件视图，按参考截图使用页面树、页面面包屑、全开/全关和不同类型控制组件。</li>
          <li><strong>已确认：</strong>主导航保留独立“配电箱设备查询”，删除“设备功能”菜单及整个页面；旧“设备功能”和“配电箱设备列表”地址兼容进入配电箱设备查询。</li>
          <li><strong>已确认：</strong>配电箱设备查询左侧将“天府校区—楼栋—房间”区域树与该区域的现有配电箱/“未分类”并排展示；校区和楼栋节点可分别展开/收起，点击节点名称仍立即筛选右侧内容。</li>
          <li><strong>已确认：</strong>配电箱设备查询顶部仅保留状态、设备备注、设备类型、型号和所属 IP 筛选，状态只包含在线和离线；条件变化后立即筛选且不增加查询/重置按钮。</li>
          <li><strong>已确认：</strong>配电箱设备查询明细列表字段与设备管理一致，并提供本页全选、行复选框和分页；区域、配电箱或顶部筛选条件变化后回到第一页并清空旧选择。</li>
          <li><strong>已确认：</strong>配电箱设备查询右上角提供导出按钮，默认导出当前区域、配电箱和顶部条件共同筛选后的全部明细，不受当前页和勾选状态限制；不提供控制、编辑或关系写操作。</li>
          <li><strong>已确认：</strong>设备管理和配电箱设备查询列表均增加“楼层节点”字段。</li>
          <li><strong>已确认：</strong>设备管理删除右上角“配电箱”入口及清除、新建、管理、选择等关系写操作；保留配电箱下拉自动筛选、列表只读展示和设备导出字段。</li>
          <li><strong>已确认：</strong>配电箱及设备关联由其他平台维护并同步，GVP 只读消费同一批同步结果；配电箱名称文字使用同步颜色或既有配置颜色，不增加颜色图标。</li>
          <li><strong>已确认：</strong>历史记录中的“设备故障”改为“设备离线”，消息内容继续显示楼栋、房间、配电箱和 IP 地址；配电箱名称文字使用其配置颜色，不增加颜色图标。</li>
          <li><strong>待确认：</strong>外部同步协议、主键、频率、失败和延迟处理，以及停用或删除关系后的显示和恢复规则。</li>
          <li><strong>已确认：</strong>楼栋、房间、配电箱和设备 IP 信息完整时，离线消息按“[楼栋 / 房间 / 配电箱] 原消息内容 IP地址：xxx.xxx.xxx.xxx”显示；任一项缺失时直接沿用原消息，不追加定位或 IP，不显示“未配置”且不保留空层级。</li>
          <li><strong>V3.2.0 能源统计分类：</strong>负责人为紫彤；添加向导共两步，先选择电表或空开，再设置区域与用电类型。电表在第二步同时选择整表或分相，空开不显示统计方式。</li>
          <li><strong>简化方案对比页：</strong>独立入口默认加载全部电表和空开回路，电表拆分为三个回路、空开显示一个回路；仅保留筛选区域、设备备注和用电类型即时筛选，并支持单选、多选后统一分配区域与用电类型。原【能源统计分类】页面保持不变。</li>
          <li><strong>已确认生命周期：</strong>分类从保存时间起生效，不回算历史；统计项不物理删除，只允许停用；统计区域允许与设备导航区域不同。</li>
          <li><strong>分析页展示：</strong>分类过多时默认展示能耗较高的前若干项；前台固定数量仍待设计确认。</li>
          <li><strong>待确认：</strong>两类来源的唯一标识、能耗字段和数据契约，以及采样留存、权限审计和测试安排。原型中的字段、状态和数据均为评审用 Mock。</li>
        </ol>
        <div class="rules-note">评审确认后，应将上述假设回写联合 PRD，再进入正式开发。此页面数据均为脱敏 Mock 数据，刷新页面即可恢复。</div>`,
      footer: `<button class="button" type="button" data-action="reset-demo">${icon("refresh")}恢复初始数据</button><button class="button primary" type="button" data-action="close-modal">知道了</button>`,
    });
  }

  function openComponentControl(id) {
    const component = getComponent(id);
    if (!component) return;
    modalRoot.innerHTML = `
      <div class="modal-backdrop component-control-backdrop" data-action="close-modal-backdrop">
        <section class="component-control-popup" role="dialog" aria-modal="true" aria-label="${escapeHtml(component.name)}控制组件">
          <button class="component-control-popup-close" type="button" data-action="close-modal" aria-label="关闭">${icon("close")}</button>
          ${renderControlWidget(component, "modal")}
        </section>
      </div>`;
    requestAnimationFrame(() => modalRoot.querySelector("input, button")?.focus());
  }

  function openComponentEdit(id) {
    const component = getComponent(id);
    if (!component) return;
    closeModal();
    state.navigation.editorComponentId = component.id;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cabinetUiLevel(cabinet, index = 0) {
    return Number.isFinite(Number(cabinet.uiLevel)) ? Number(cabinet.uiLevel) : 20 + ((index * 11) % 65);
  }

  function cabinetUiColor(cabinet, index = 0) {
    const level = cabinetUiLevel(cabinet, index);
    return `hsl(${318 + Math.round(level * 0.15)} 92% ${56 + Math.round(level * 0.06)}%)`;
  }

  function openModifyIpModal() {
    const selectedIds = [...state.devices.selected];
    if (selectedIds.length !== 1) {
      showToast("修改 IP 时请只勾选一台设备", "warning");
      return;
    }
    const device = model.devices.find((item) => item.id === selectedIds[0]);
    openModal({
      title: "修改设备 IP",
      body: `<div class="form-group"><label>设备</label><input class="form-control" value="${escapeHtml(device.remark)}" disabled></div><div class="form-group" style="margin-top:16px"><label class="required" for="deviceIp">所属 IP</label><input class="form-control" id="deviceIp" value="${escapeHtml(device.ip)}" inputmode="decimal"><div class="form-error" id="deviceIpError"></div></div>`,
      footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button primary" type="button" data-action="save-device-ip" data-id="${device.id}">保存</button>`,
    });
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "!" : type === "warning" ? "!" : "i"}</span><span class="toast-message">${escapeHtml(message)}</span>`;
    toastStack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
  }

  function downloadCsv(filename, headers, rows) {
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = `\ufeff${[headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function applyDeviceFilter() {
    state.devices.filterField = document.getElementById("deviceFilterField")?.value ?? "remark";
    state.devices.appliedKeyword = document.getElementById("deviceKeyword")?.value.trim() ?? "";
    state.devices.appliedType = document.getElementById("deviceType")?.value ?? "all";
    state.devices.appliedCabinet = document.getElementById("deviceCabinet")?.value ?? "all";
    state.devices.page = 1;
    render();
  }

  function applyHistoryFilter() {
    state.history.appliedType = document.getElementById("historyType")?.value ?? "all";
    state.history.appliedDate = document.getElementById("historyDate")?.value ?? "all";
    state.history.page = 1;
    render();
  }

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.form === "device-filter") applyDeviceFilter();
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "overviewPeriod") {
      state.overview.selectedMonth = target.value;
      render();
      return;
    }
    if (target.matches("[data-energy-assignment-filter]")) {
      state.energyAssignment[target.dataset.energyAssignmentFilter] = target.value;
      state.energyAssignment.page = 1;
      state.energyAssignment.selected.clear();
      render();
      return;
    }
    if (target.matches("[data-energy-assignment-usage]")) {
      const draft = state.energyAssignment.assignmentDraft;
      if (draft) draft.usageType = target.value;
      const error = document.getElementById("energyAssignmentError");
      if (error) error.textContent = "";
      return;
    }
    if (target.matches("[data-energy-filter]")) {
      const key = target.dataset.energyFilter;
      state.energyClassification[key] = target.value;
      state.energyClassification.abnormalOnly = false;
      state.energyClassification.page = 1;
      render();
      return;
    }
    if (target.matches('[data-action="select-energy-assignment"]')) {
      const id = target.dataset.id;
      if (target.checked) state.energyAssignment.selected.add(id);
      else state.energyAssignment.selected.delete(id);
      render();
      return;
    }
    if (target.matches('[data-action="select-all-energy-assignment"]')) {
      const view = state.energyAssignment;
      const filtered = filteredEnergyAssignmentRows();
      const pageItems = filtered.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
      pageItems.forEach((item) => (target.checked ? view.selected.add(item.id) : view.selected.delete(item.id)));
      render();
      return;
    }
    if (target.matches("[data-energy-assignment]")) {
      const draft = state.energyClassification.draft;
      if (!draft) return;
      ensureEnergyAssignment(draft, target.dataset.target)[target.dataset.energyAssignment] = target.value;
      return;
    }
    if (target.matches("[data-energy-edit-assignment]")) {
      const draft = state.energyClassification.editDraft;
      if (!draft) return;
      const assignment = draft.assignments[target.dataset.target];
      if (assignment) assignment[target.dataset.energyEditAssignment] = target.value;
      return;
    }
    if (target.id === "cabinetFunctionFilterField") {
      state.cabinetFunctions.filterField = target.value;
      state.cabinetFunctions.filterValue = "";
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.selected.clear();
      render();
      return;
    }
    if (target.id === "cabinetFunctionFilterValue") {
      state.cabinetFunctions.filterValue = target.value;
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.selected.clear();
      render();
      return;
    }
    if (target.matches('[data-action="page-size"]')) {
      const scope = target.dataset.scope;
      if (state[scope]) {
        state[scope].pageSize = Number(target.value);
        state[scope].page = 1;
        render();
      }
    }
    if (target.matches('[data-action="select-cabinet-function"]')) {
      const id = target.dataset.id;
      if (target.checked) state.cabinetFunctions.selected.add(id);
      else state.cabinetFunctions.selected.delete(id);
      render();
    }
    if (target.matches('[data-action="select-all-cabinet-functions"]')) {
      const { visibleDevices } = getCabinetDeviceQueryContext();
      const view = state.cabinetFunctions;
      const pageItems = visibleDevices.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);
      pageItems.forEach((item) => (target.checked ? view.selected.add(item.id) : view.selected.delete(item.id)));
      render();
    }
    if (target.matches('[data-action="select-device"]')) {
      const id = target.dataset.id;
      if (target.checked) state.devices.selected.add(id);
      else state.devices.selected.delete(id);
      render();
    }
    if (target.matches('[data-action="select-all-devices"]')) {
      const filtered = filteredDevices();
      const pageItems = filtered.slice((state.devices.page - 1) * state.devices.pageSize, state.devices.page * state.devices.pageSize);
      pageItems.forEach((item) => (target.checked ? state.devices.selected.add(item.id) : state.devices.selected.delete(item.id)));
      render();
    }
    if (["historyType", "historyDate"].includes(target.id)) applyHistoryFilter();
    if (["deviceFilterField", "deviceType", "deviceCabinet"].includes(target.id)) applyDeviceFilter();
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-energy-assignment-text-filter]")) {
      state.energyAssignment.deviceRemark = target.value;
      state.energyAssignment.page = 1;
      state.energyAssignment.selected.clear();
      window.clearTimeout(energyAssignmentFilterTimer);
      energyAssignmentFilterTimer = window.setTimeout(() => {
        render();
        requestAnimationFrame(() => {
          const input = document.querySelector("[data-energy-assignment-text-filter]");
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        });
      }, 200);
      return;
    }
    if (target.matches("[data-energy-text-filter]")) {
      const key = target.dataset.energyTextFilter;
      state.energyClassification[key] = target.value;
      state.energyClassification.abnormalOnly = false;
      state.energyClassification.page = 1;
      window.clearTimeout(energyFilterTimer);
      energyFilterTimer = window.setTimeout(() => {
        render();
        requestAnimationFrame(() => {
          const input = document.querySelector(`[data-energy-text-filter="${key}"]`);
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        });
      }, 200);
      return;
    }
    if (target.id === "cabinetFunctionFilterInput") {
      state.cabinetFunctions.filterValue = target.value;
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.selected.clear();
      window.clearTimeout(cabinetFunctionFilterTimer);
      cabinetFunctionFilterTimer = window.setTimeout(() => {
        render();
        requestAnimationFrame(() => {
          const input = document.getElementById("cabinetFunctionFilterInput");
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        });
      }, 250);
      return;
    }
    if (target.id === "deviceKeyword") {
      state.devices.appliedKeyword = target.value.trim();
      state.devices.page = 1;
      window.clearTimeout(deviceFilterTimer);
      deviceFilterTimer = window.setTimeout(() => {
        render();
        requestAnimationFrame(() => {
          const input = document.getElementById("deviceKeyword");
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        });
      }, 250);
      return;
    }
    if (target.id === "editorWidth" || target.id === "editorHeight") {
      const preview = document.querySelector(".component-editor-preview");
      if (preview) {
        const value = Math.max(Number(target.min), Math.min(Number(target.max), Number(target.value) || Number(target.min)));
        preview.style.setProperty(target.id === "editorWidth" ? "--editor-preview-width" : "--editor-preview-height", `${value}px`);
      }
      return;
    }
    if (target.id === "pageTreeSearch") {
      const keyword = target.value.trim().toLocaleLowerCase("zh-CN");
      document.querySelectorAll("[data-page-tree-name]").forEach((pageNode) => {
        pageNode.style.display = !keyword || pageNode.dataset.pageTreeName.includes(keyword) ? "flex" : "none";
      });
      return;
    }
    if (target.matches("[data-control]")) {
      const component = getComponent(target.dataset.id);
      if (!component) return;
      const control = target.dataset.control;
      const value = Number(target.value);
      component[control] = value;
      if (control === "position") component.state = value > 0 ? "on" : "off";
      const suffix = control === "temperature" ? "K" : control === "setpoint" ? "℃" : "%";
      document.querySelectorAll(`[data-control-output="${control}"][data-id="${component.id}"]`).forEach((output) => {
        output.textContent = `${value}${suffix}`;
      });
      if (control === "position") {
        const curtain = target.closest(".control-widget")?.querySelector(".curtain-visual span");
        if (curtain) curtain.style.height = `${Math.max(15, 100 - value)}%`;
      }
    }
  });

  document.addEventListener("click", (event) => {
    const clickedRegionPicker = event.target.closest("[data-energy-region-picker]");
    document.querySelectorAll("[data-energy-region-picker].open").forEach((picker) => {
      if (picker === clickedRegionPicker) return;
      picker.classList.remove("open");
      picker.querySelector(".energy-region-trigger")?.setAttribute("aria-expanded", "false");
    });
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      if (pageButton.dataset.page === "navigation" && state.page === "navigation" && state.navigation.editorComponentId) {
        state.navigation.editorComponentId = null;
        render();
        return;
      }
      window.location.hash = pageButton.dataset.page;
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "toggle-energy-region-picker") {
      const picker = target.closest("[data-energy-region-picker]");
      if (!picker) return;
      const shouldOpen = !picker.classList.contains("open");
      document.querySelectorAll("[data-energy-region-picker].open").forEach((item) => {
        item.classList.remove("open");
        item.querySelector(".energy-region-trigger")?.setAttribute("aria-expanded", "false");
      });
      picker.classList.toggle("open", shouldOpen);
      target.setAttribute("aria-expanded", String(shouldOpen));
      return;
    }
    if (action === "toggle-energy-region-node") {
      const node = target.closest("[data-energy-region-node]");
      if (!node) return;
      const expanded = node.classList.toggle("expanded");
      target.setAttribute("aria-expanded", String(expanded));
      return;
    }
    if (action === "select-energy-region") {
      const value = target.dataset.regionValue;
      const context = target.dataset.regionContext;
      if (!value || !context) return;
      if (context === "simple-filter") {
        state.energyAssignment.filterArea = value;
        state.energyAssignment.page = 1;
        state.energyAssignment.selected.clear();
        render();
        return;
      }
      if (context === "filter") {
        state.energyClassification.statisticsArea = value;
        state.energyClassification.abnormalOnly = false;
        state.energyClassification.page = 1;
        render();
        return;
      }
      if (context === "assignment") {
        const draft = state.energyClassification.draft;
        if (!draft) return;
        ensureEnergyAssignment(draft, target.dataset.regionTarget).area = value;
      }
      if (context === "edit-assignment") {
        const draft = state.energyClassification.editDraft;
        if (!draft) return;
        const assignment = draft.assignments[target.dataset.regionTarget];
        if (assignment) assignment.area = value;
      }
      if (context === "edit") {
        const input = document.getElementById("energyEditArea");
        if (input) input.value = value;
      }
      if (context === "simple-assignment") {
        const draft = state.energyAssignment.assignmentDraft;
        if (draft) draft.area = value;
        const error = document.getElementById("energyAssignmentError");
        if (error) error.textContent = "";
      }
      const picker = target.closest("[data-energy-region-picker]");
      if (picker) {
        const trigger = picker.querySelector(".energy-region-trigger");
        const triggerText = trigger?.querySelector("span");
        if (triggerText) triggerText.textContent = value;
        if (trigger) {
          trigger.title = value;
          trigger.setAttribute("aria-expanded", "false");
        }
        picker.querySelectorAll(".energy-region-option.selected, .energy-region-all.selected").forEach((item) => item.classList.remove("selected"));
        target.classList.add("selected");
        picker.classList.remove("open");
      }
      return;
    }
    if (action === "energy-assignment-details") {
      const id = target.dataset.id;
      if (id) openEnergyDetails(id);
      return;
    }
    if (action === "assign-energy-row") {
      const id = target.dataset.id;
      if (id) openEnergyAssignmentModal([id]);
      return;
    }
    if (action === "open-energy-assignment") {
      openEnergyAssignmentModal();
      return;
    }
    if (action === "save-energy-assignment") {
      saveEnergyAssignment();
      return;
    }
    if (action === "sort-energy") {
      const view = state.energyClassification;
      const sortKey = target.dataset.sortKey;
      if (!sortKey) return;
      if (view.sortKey === sortKey) view.sortDirection = view.sortDirection === "asc" ? "desc" : "asc";
      else {
        view.sortKey = sortKey;
        view.sortDirection = "asc";
      }
      view.page = 1;
      render();
      return;
    }
    if (action === "open-energy-add") {
      openEnergyAddModal(true);
      return;
    }
    if (action === "manage-energy-types") {
      openEnergyTypeManager();
      return;
    }
    if (action === "edit-energy-type") {
      openEnergyTypeEdit(target.dataset.id);
      return;
    }
    if (action === "delete-energy-type") {
      openEnergyTypeDelete(target.dataset.id);
      return;
    }
    if (action === "toggle-energy-type") {
      const type = model.energyTypes.find((item) => item.id === target.dataset.id);
      if (!type) return;
      type.enabled = !type.enabled;
      if (!type.enabled && state.energyClassification.usageType === type.name) {
        state.energyClassification.usageType = "all";
        state.energyClassification.page = 1;
      }
      if (!type.enabled && state.energyAssignment.usageType === type.name) {
        state.energyAssignment.usageType = "all";
        state.energyAssignment.page = 1;
      }
      openEnergyTypeManager();
      showToast(`已${type.enabled ? "启用" : "禁用"}用电类型“${type.name}”`, "success");
      return;
    }
    if (action === "overview-trend-range") {
      const range = target.dataset.range;
      if (Object.hasOwn(overviewTrendRangeLabels, range)) state.overview.trendRange = range;
      render();
      return;
    }
    if (action === "energy-select-device") {
      const draft = state.energyClassification.draft;
      selectEnergyDraftDevice(draft, target.dataset.id);
      openEnergyAddModal();
      return;
    }
    if (action === "energy-select-mode") {
      const draft = state.energyClassification.draft;
      if (!draft) return;
      if (target.dataset.mode === "整表" && (draft.lockedFunctionIds?.length ?? 0) > 0) {
        showToast("该设备已有分相统计项，如需改为整表请在主列表中编辑", "warning");
        return;
      }
      draft.mode = target.dataset.mode;
      draft.assignments = {};
      openEnergyAddModal();
      return;
    }
    if (action === "energy-edit-select-mode") {
      const draft = state.energyClassification.editDraft;
      if (!draft) return;
      draft.mode = target.dataset.mode;
      openEnergyEdit(draft.itemId, false);
      return;
    }
    if (action === "energy-toggle-function") {
      const draft = state.energyClassification.draft;
      const functionId = target.dataset.id;
      if (!draft || !functionId) return;
      if (draft.lockedFunctionIds?.includes(functionId)) return;
      if (target.checked) {
        if (!draft.selectedFunctionIds.includes(functionId)) draft.selectedFunctionIds.push(functionId);
      } else {
        draft.selectedFunctionIds = draft.selectedFunctionIds.filter((id) => id !== functionId);
      }
      openEnergyAddModal();
      return;
    }
    if (action === "energy-step-prev") {
      state.energyClassification.addStep = Math.max(1, state.energyClassification.addStep - 1);
      openEnergyAddModal();
      return;
    }
    if (action === "energy-step-next") {
      const view = state.energyClassification;
      if (!view.draft?.deviceId || !availableEnergyDevices().some((device) => device.id === view.draft.deviceId)) {
        showToast("当前没有可添加的能源设备", "warning");
        return;
      }
      view.addStep = Math.min(2, view.addStep + 1);
      openEnergyAddModal();
      return;
    }
    if (action === "save-energy-statistics") {
      saveEnergyStatistics();
      return;
    }
    if (action === "energy-details") {
      openEnergyDetails(target.dataset.id);
      return;
    }
    if (action === "energy-detail-range") {
      state.energyClassification.detailRange = target.dataset.range || "30d";
      openEnergyDetails(target.dataset.id);
      return;
    }
    if (action === "energy-edit") {
      openEnergyEdit(target.dataset.id);
      return;
    }
    if (action === "save-energy-meter-edit") {
      saveEnergyMeterEdit(target.dataset.id);
      return;
    }
    if (action === "save-energy-edit") {
      const item = model.energyStatistics.find((entry) => entry.id === target.dataset.id);
      if (!item) return;
      item.statisticsArea = document.getElementById("energyEditArea")?.value ?? item.statisticsArea;
      item.usageType = document.getElementById("energyEditUsage")?.value ?? item.usageType;
      item.classificationStatus = "已分类";
      item.effectiveAt = "2026-10-29 15:10";
      closeModal();
      render();
      showToast("分类已更新，从本次保存时间起生效，历史数据不回算", "success");
      return;
    }
    if (action === "add-energy-type") {
      const input = document.getElementById("newEnergyTypeName");
      const name = input?.value.trim() ?? "";
      if (!name) {
        showToast("请输入用电类型名称", "warning");
        input?.focus();
        return;
      }
      if (model.energyTypes.some((type) => type.name === name)) {
        showToast("该用电类型已存在", "warning");
        return;
      }
      model.energyTypes.push({ id: `custom-${Date.now()}`, name, builtIn: false, enabled: true });
      openEnergyTypeManager();
      showToast(`已新增用电类型“${name}”`, "success");
      return;
    }
    if (action === "save-energy-type") {
      const type = model.energyTypes.find((item) => item.id === target.dataset.id);
      const input = document.getElementById("energyTypeEditName");
      const name = input?.value.trim() ?? "";
      if (!type) return;
      if (!name) {
        showToast("请输入用电类型名称", "warning");
        input?.focus();
        return;
      }
      if (model.energyTypes.some((item) => item.id !== type.id && item.name === name)) {
        showToast("该用电类型已存在", "warning");
        input?.focus();
        return;
      }
      const oldName = type.name;
      type.name = name;
      model.energyStatistics.forEach((item) => {
        if (item.usageType === oldName) item.usageType = name;
      });
      model.energyAssignmentRows.forEach((item) => {
        if (item.usageType === oldName) item.usageType = name;
      });
      (model.energyClassificationHistory ?? []).forEach((item) => {
        if (item.usageType === oldName) item.usageType = name;
      });
      if (state.energyClassification.usageType === oldName) state.energyClassification.usageType = name;
      if (state.energyAssignment.usageType === oldName) state.energyAssignment.usageType = name;
      openEnergyTypeManager();
      showToast(`已将用电类型“${oldName}”修改为“${name}”`, "success");
      return;
    }
    if (action === "confirm-delete-energy-type") {
      const type = model.energyTypes.find((item) => item.id === target.dataset.id);
      if (!type) return;
      const referenced = model.energyStatistics.some((item) => item.usageType === type.name)
        || model.energyAssignmentRows.some((item) => item.usageType === type.name)
        || (model.energyClassificationHistory ?? []).some((item) => item.usageType === type.name);
      if (referenced) {
        openEnergyTypeManager();
        showToast(`“${type.name}”正在被引用，不能删除`, "warning");
        return;
      }
      model.energyTypes = model.energyTypes.filter((item) => item.id !== type.id);
      if (state.energyClassification.usageType === type.name) {
        state.energyClassification.usageType = "all";
        state.energyClassification.page = 1;
      }
      if (state.energyAssignment.usageType === type.name) {
        state.energyAssignment.usageType = "all";
        state.energyAssignment.page = 1;
      }
      openEnergyTypeManager();
      showToast(`已删除用电类型“${type.name}”`, "success");
      return;
    }
    if (action === "set-energy-summary-filter") {
      const view = state.energyClassification;
      Object.assign(view, { deviceRemark: "", deviceType: "all", protocol: "all", deviceModel: "", mode: "all", functionName: "", usageType: "all", statisticsArea: "all", dataStatus: "all", abnormalOnly: false, page: 1 });
      if (target.dataset.filter === "abnormal") view.abnormalOnly = true;
      render();
      return;
    }
    if (action === "set-location") {
      if (target.dataset.scope === "navigation") {
        state.navigation.selectedLocation = target.dataset.location;
      }
      render();
      return;
    }
    if (action === "toggle-cabinet-area") {
      const areaId = target.dataset.areaId;
      const expandedAreaIds = state.cabinetFunctions.expandedAreaIds;
      if (expandedAreaIds.has(areaId)) expandedAreaIds.delete(areaId);
      else expandedAreaIds.add(areaId);
      render();
      return;
    }
    if (action === "select-cabinet-area") {
      state.cabinetFunctions.selectedAreaId = target.dataset.areaId;
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.selected.clear();
      render();
      return;
    }
    if (action === "select-cabinet-query-cabinet") {
      state.cabinetFunctions.selectedCabinetId = target.dataset.cabinetId;
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.selected.clear();
      render();
      return;
    }
    if (action === "paginate") {
      const scope = target.dataset.scope;
      if (state[scope]) state[scope].page = Math.max(1, Number(target.dataset.pageNum));
      render();
      return;
    }
    if (action === "open-component-control" || action === "control-component") {
      openComponentControl(target.dataset.id);
      return;
    }
    if (action === "toggle-component-power" || action === "set-component-power") {
      const component = getComponent(target.dataset.id);
      if (component) {
        component.state = action === "set-component-power" ? target.dataset.value : component.state === "on" ? "off" : "on";
        if (target.dataset.context === "modal") openComponentControl(component.id);
        else render();
        showToast(`${component.name} 已${component.state === "on" ? "开启" : "关闭"}`, "success");
      }
      return;
    }
    if (action === "control-all-components") {
      const value = target.dataset.value;
      const targets = model.components.filter((item) => item.roomId === target.dataset.roomId);
      targets.forEach((component) => {
        component.state = value;
        if (component.controlType === "curtain") {
          component.position = value === "on" ? 100 : 0;
          component.command = value === "on" ? "open" : "close";
        }
      });
      render();
      showToast(`当前页面组件已${value === "on" ? "全开" : "全关"}`, "success");
      return;
    }
    if (action === "adjust-setpoint") {
      const component = getComponent(target.dataset.id);
      component.setpoint = Math.min(32, Math.max(16, component.setpoint + Number(target.dataset.delta)));
      if (target.dataset.context === "modal") openComponentControl(component.id);
      else render();
      return;
    }
    if (action === "set-component-mode") {
      const component = getComponent(target.dataset.id);
      component.mode = target.dataset.value;
      component.state = "on";
      if (target.dataset.context === "modal") openComponentControl(component.id);
      else render();
      return;
    }
    if (action === "set-component-fan") {
      const component = getComponent(target.dataset.id);
      component.fanSpeed = target.dataset.value;
      component.state = "on";
      if (target.dataset.context === "modal") openComponentControl(component.id);
      else render();
      return;
    }
    if (action === "set-curtain-command") {
      const component = getComponent(target.dataset.id);
      component.command = target.dataset.value;
      if (component.command === "open") {
        component.position = 100;
        component.state = "on";
      }
      if (component.command === "close") {
        component.position = 0;
        component.state = "off";
      }
      if (target.dataset.context === "modal") openComponentControl(component.id);
      else render();
      showToast(`${component.name} 已执行${component.command === "open" ? "打开" : component.command === "close" ? "关闭" : "停止"}`, "success");
      return;
    }
    if (action === "set-fan-level") {
      const component = getComponent(target.dataset.id);
      component.fanSpeed = target.dataset.value;
      component.state = "on";
      if (target.dataset.context === "modal") openComponentControl(component.id);
      else render();
      return;
    }
    if (action === "add-page-placeholder") {
      showToast("新增页面不在本次需求范围，Demo 仅保留截图中的入口", "info");
      return;
    }
    if (action === "save-component-layout") {
      showToast("组件布局和控制状态已保存到当前 Demo 会话", "success");
      return;
    }
    if (action === "edit-component") {
      openComponentEdit(target.dataset.id);
      return;
    }
    if (action === "close-component-editor") {
      state.navigation.editorComponentId = null;
      render();
      return;
    }
    if (action === "editor-toolbar-placeholder") {
      showToast(target.dataset.message || "样式工具已应用到当前 Demo 预览", "info");
      return;
    }
    if (action === "editor-undo") {
      const component = getComponent(state.navigation.editorComponentId);
      if (component) {
        const name = document.getElementById("componentEditorName");
        const description = document.getElementById("componentEditorDescription");
        const page = document.getElementById("componentEditorPage");
        if (name) name.value = component.name;
        if (description) description.value = component.remark;
        if (page) page.value = component.roomId;
      }
      showToast("已撤销未保存的信息修改", "info");
      return;
    }
    if (action === "editor-redo") {
      showToast("当前没有可恢复的修改", "info");
      return;
    }
    if (action === "editor-add-node") {
      showToast("当前组件已关联一个导航节点，可直接修改所属页面", "info");
      return;
    }
    if (action === "editor-remove-node") {
      showToast("组件至少保留一个所属页面，不能删除当前唯一节点", "warning");
      return;
    }
    if (action === "save-component") {
      const component = model.components.find((item) => item.id === target.dataset.id);
      const nameInput = document.getElementById("componentEditorName");
      const name = nameInput?.value.trim() ?? "";
      if (!name) {
        document.getElementById("componentEditorNameError").textContent = "请输入组件名称";
        return;
      }
      const roomId = document.getElementById("componentEditorPage").value;
      const room = model.locations.flatMap((item) => item.rooms).find((item) => item.id === roomId);
      Object.assign(component, { name, remark: document.getElementById("componentEditorDescription").value.trim(), roomId, page: room?.name ?? component.page });
      state.navigation.editorComponentId = null;
      showToast(`已保存组件“${name}”`, "success");
      render();
      return;
    }
    if (action === "clear-device-selection") {
      state.devices.selected.clear();
      render();
      return;
    }
    if (action === "export-cabinet-functions") {
      const { visibleDevices } = getCabinetDeviceQueryContext();
      const rows = visibleDevices.map((device) => {
        const cabinet = displayCabinet(device);
        return [
          device.remark,
          device.type,
          device.status === "online" ? "在线" : "离线",
          device.protocol,
          device.model,
          device.product,
          device.address,
          device.connection,
          device.ip,
          cabinet?.name ?? "",
          deviceLocationPath(device),
        ];
      });
      downloadCsv("配电箱设备查询-筛选结果.csv", ["设备备注", "设备类型", "状态", "协议", "型号", "产品名", "设备地址", "连接方式", "所属IP", "配电箱", "楼层节点"], rows);
      showToast(`已导出当前筛选后的全部数据，共 ${rows.length} 条`, "success");
      return;
    }
    if (action === "export-devices") {
      const rows = filteredDevices().map((device) => {
        const cabinet = displayCabinet(device);
        return [device.remark, device.type, device.status === "online" ? "在线" : "离线", device.protocol, device.model, device.product, device.address, device.connection, device.ip, cabinet?.name ?? "", deviceLocationPath(device)];
      });
      downloadCsv("设备管理-导出.csv", ["设备备注", "设备类型", "状态", "协议", "型号", "产品名", "设备地址", "连接方式", "所属IP", "配电箱", "楼层节点"], rows);
      showToast("已导出当前筛选结果，包含配电箱和楼层节点字段", "success");
      return;
    }
    if (action === "modify-ip") {
      openModifyIpModal();
      return;
    }
    if (action === "save-device-ip") {
      const input = document.getElementById("deviceIp");
      const value = input.value.trim();
      const valid = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split(".").every((segment) => Number(segment) <= 255);
      if (!valid) {
        document.getElementById("deviceIpError").textContent = "请输入有效的 IPv4 地址";
        return;
      }
      const device = model.devices.find((item) => item.id === target.dataset.id);
      device.ip = value;
      closeModal();
      render();
      showToast(`已修改“${device.remark}”的 IP`, "success");
      return;
    }
    if (action === "monitor-status") {
      const count = state.devices.selected.size;
      showToast(count ? `已刷新 ${count} 台设备的监测状态` : "已刷新当前列表的监测状态", "success");
      return;
    }
    if (action === "export-history") {
      const entries = model.history.filter((entry) => (state.history.appliedType === "all" || entry.type === state.history.appliedType) && (state.history.appliedDate === "all" || (state.history.appliedDate === "today" && entry.at.startsWith("2026-08-25")) || (state.history.appliedDate === "7days" && entry.at >= "2026-08-19")));
      downloadCsv("历史记录-导出.csv", ["类型", "日期和时间", "消息内容"], entries.map((entry) => [entry.type, entry.at, historyMessageText(entry)]));
      showToast("已导出历史记录，字段保持为三列", "success");
      return;
    }
    if (action === "clear-history") {
      openModal({ title: "清空历史记录", body: `<div class="confirm-message">确定清空当前 Demo 中的全部历史记录吗？此操作只影响当前页面内存，刷新页面即可恢复。</div>`, footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button danger" type="button" data-action="confirm-clear-history">确认清空</button>` });
      return;
    }
    if (action === "confirm-clear-history") {
      model.history = [];
      state.history.page = 1;
      closeModal();
      render();
      showToast("历史记录已清空，可刷新页面恢复", "success");
      return;
    }
    if (action === "show-rules") {
      showRules();
      return;
    }
    if (action === "reset-demo") {
      model = window.GVP_DEMO_DATA.create();
      state.overview.selectedMonth = "2026-10";
      state.devices.selected.clear();
      state.cabinetFunctions.selectedAreaId = "all";
      state.cabinetFunctions.selectedCabinetId = "cab-001";
      state.cabinetFunctions.expandedAreaIds = new Set(["all", ...model.locations.map((building) => building.id)]);
      state.cabinetFunctions.filterField = "remark";
      state.cabinetFunctions.filterValue = "";
      state.cabinetFunctions.page = 1;
      state.cabinetFunctions.pageSize = 10;
      state.cabinetFunctions.selected.clear();
      state.navigation.editorComponentId = null;
      Object.assign(state.energyClassification, { deviceRemark: "", deviceType: "all", protocol: "all", deviceModel: "", mode: "all", functionName: "", usageType: "all", statisticsArea: "all", dataStatus: "all", abnormalOnly: false, sortKey: null, sortDirection: "asc", page: 1, pageSize: 10, addStep: 1, draft: null });
      Object.assign(state.energyAssignment, { filterArea: "all", deviceRemark: "", usageType: "all", page: 1, pageSize: 10, assignmentDraft: null });
      state.energyAssignment.selected.clear();
      closeModal();
      render();
      showToast("已恢复 Demo 初始数据", "success");
      return;
    }
    if (action === "show-user-menu") {
      showToast("当前为评审账号 admin", "info");
      return;
    }
    if (action === "close-modal") {
      closeModal();
      return;
    }
    if (action === "close-modal-backdrop" && event.target === target) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modalRoot.innerHTML) closeModal();
    }
  });

  window.addEventListener("hashchange", render);

  if (!window.location.hash) {
    window.location.hash = "overview";
  } else {
    render();
  }
})();
