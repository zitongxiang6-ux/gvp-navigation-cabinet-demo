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
    navigation: {
      view: "component",
      selectedLocation: "room-a102",
      appliedName: "",
      appliedType: "all",
      page: 1,
      pageSize: 10,
      editorComponentId: null,
      editorReturnView: "component",
    },
    devices: {
      filterField: "remark",
      appliedKeyword: "",
      appliedType: "all",
      appliedCabinet: "all",
      page: 1,
      pageSize: 10,
      selected: new Set(),
      cabinetMenuOpen: false,
    },
    history: {
      appliedType: "all",
      appliedDate: "all",
      page: 1,
      pageSize: 10,
    },
    openTree: null,
  };

  let navigationFilterTimer = null;
  let deviceFilterTimer = null;

  const pageNames = {
    overview: "首页",
    navigation: "导航",
    history: "历史记录",
    devices: "设备管理",
  };

  function getPageFromHash() {
    const value = window.location.hash.replace(/^#/, "");
    const validPages = ["overview", "navigation", "history", "devices"];
    return validPages.includes(value) ? value : "navigation";
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

  function locationLabel(id) {
    if (id === "all") return "全部页面";
    const building = model.locations.find((item) => item.id === id);
    if (building) return building.name;
    for (const item of model.locations) {
      const room = item.rooms.find((candidate) => candidate.id === id);
      if (room) return `${item.name} / ${room.name}`;
    }
    return "全部页面";
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

  function treeSelectHtml(scope, selectedId) {
    const isOpen = state.openTree === scope;
    const nodes = [
      `<button class="tree-node${selectedId === "all" ? " active" : ""}" type="button" data-action="set-location" data-scope="${scope}" data-location="all">全部页面</button>`,
    ];
    for (const building of model.locations) {
      nodes.push(
        `<button class="tree-node building${selectedId === building.id ? " active" : ""}" type="button" data-action="set-location" data-scope="${scope}" data-location="${building.id}">⌄ ${escapeHtml(building.name)}</button>`,
      );
      for (const room of building.rooms) {
        nodes.push(
          `<button class="tree-node room${selectedId === room.id ? " active" : ""}" type="button" data-action="set-location" data-scope="${scope}" data-location="${room.id}">${escapeHtml(room.name)}</button>`,
        );
      }
    }
    return `
      <div class="tree-select${isOpen ? " open" : ""}">
        <button class="tree-select-trigger" type="button" data-action="toggle-tree" data-scope="${scope}">
          <span title="${escapeHtml(locationLabel(selectedId))}">${escapeHtml(locationLabel(selectedId))}</span>
        </button>
        <div class="tree-panel">${nodes.join("")}</div>
      </div>`;
  }

  function pageMatchesLocation(roomId, selectedId) {
    if (selectedId === "all") return true;
    if (roomId === selectedId) return true;
    const building = model.locations.find((item) => item.id === selectedId);
    return Boolean(building?.rooms.some((room) => room.id === roomId));
  }

  function componentTypes() {
    return [...new Set(model.components.map((item) => item.type))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  }

  function filteredNavigationComponents() {
    const nav = state.navigation;
    const keyword = nav.appliedName.trim().toLocaleLowerCase("zh-CN");
    return model.components.filter(
      (item) =>
        pageMatchesLocation(item.roomId, nav.selectedLocation) &&
        (nav.appliedType === "all" || item.type === nav.appliedType) &&
        (!keyword || `${item.name} ${item.remark}`.toLocaleLowerCase("zh-CN").includes(keyword)),
    );
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
    pageTitle.textContent = pageNames[state.page] ?? "GVP";
    document.querySelectorAll(".side-nav-item[data-page]").forEach((item) => {
      const target = item.dataset.page;
      item.classList.toggle("active", target === state.page);
    });

    switch (state.page) {
      case "navigation":
        app.innerHTML = state.navigation.editorComponentId ? renderComponentEditorPage() : renderNavigationPage();
        break;
      case "devices":
        app.innerHTML = renderDevicePage();
        break;
      case "history":
        app.innerHTML = renderHistoryPage();
        break;
      default:
        app.innerHTML = renderPlaceholderPage(state.page);
        break;
    }
    app.focus({ preventScroll: true });
  }

  function renderNavigationPage() {
    const nav = state.navigation;
    const switcher = `
      <div class="view-switch" aria-label="组件展示方式">
        <button type="button" class="${nav.view === "component" ? "active" : ""}" data-action="set-nav-view" data-view="component">组件视图</button>
        <button type="button" class="${nav.view === "list" ? "active" : ""}" data-action="set-nav-view" data-view="list">列表视图</button>
      </div>`;

    if (nav.view === "component") {
      return `
        <section class="page component-page">
          ${renderComponentCanvas(switcher)}
        </section>`;
    }

    const filtered = filteredNavigationComponents();
    const totalPages = Math.max(1, Math.ceil(filtered.length / nav.pageSize));
    if (nav.page > totalPages) nav.page = totalPages;
    const pageItems = filtered.slice((nav.page - 1) * nav.pageSize, nav.page * nav.pageSize);

    const rows = pageItems.length
      ? pageItems
          .map(
            (item) => `
              <tr>
                <td title="${escapeHtml(`${item.name} ${item.remark}`)}">
                  <strong>${escapeHtml(item.name)}</strong><span style="color:#9399ad;margin-left:8px">${escapeHtml(item.remark)}</span>
                </td>
                <td>${escapeHtml(item.type)}</td>
                <td>${escapeHtml(item.page)}</td>
                <td class="action-cell">
                  <div class="table-action-group">
                    <button class="action-link" type="button" data-action="open-component-control" data-id="${item.id}">${icon("power")}控制</button>
                    <button class="action-link" type="button" data-action="edit-component" data-id="${item.id}">${icon("edit")}编辑</button>
                  </div>
                </td>
              </tr>`,
          )
          .join("")
      : `<tr><td colspan="4"><div class="empty-state"><div><strong>没有匹配的组件</strong>请调整所属页面、名称备注或组件类型</div></div></td></tr>`;

    return `
      <section class="page">
        <div class="page-header navigation-list-header controls-only">
          <div class="navigation-list-header-actions">
            <div class="stage-global-controls list-global-controls">
              <button class="global-control-button open" type="button" data-action="control-all-components" data-control-scope="list" data-value="on"${filtered.length ? "" : " disabled"}>全开</button>
              <button class="global-control-button close" type="button" data-action="control-all-components" data-control-scope="list" data-value="off"${filtered.length ? "" : " disabled"}>全关</button>
            </div>
            ${switcher}
          </div>
        </div>
        <div class="page-panel">
          <div class="toolbar compact">
            <div class="toolbar-group">
              ${treeSelectHtml("navigation", nav.selectedLocation)}
              <div class="search-field">
                ${icon("search")}
                <input id="navKeyword" value="${escapeHtml(nav.appliedName)}" placeholder="搜索名称备注" autocomplete="off" />
              </div>
              <div class="field">
                <select id="navType" aria-label="组件类型">
                  <option value="all">全部组件类型</option>
                  ${componentTypes().map((type) => `<option value="${escapeHtml(type)}"${nav.appliedType === type ? " selected" : ""}>${escapeHtml(type)}</option>`).join("")}
                </select>
              </div>
            </div>
          </div>
          <div class="table-wrap" style="margin-top:18px">
            <table class="data-table">
              <colgroup><col style="width:34%"><col style="width:19%"><col style="width:25%"><col style="width:22%"></colgroup>
              <thead><tr><th>名称备注</th><th>组件类型</th><th>所属页面</th><th>操作</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${pagerHtml(filtered.length, nav.page, nav.pageSize, "navigation")}
        </div>
      </section>`;
  }

  function renderComponentCanvas(switcher) {
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
              </tr>`;
          })
          .join("")
      : `<tr><td colspan="11"><div class="empty-state"><div><strong>没有匹配的设备</strong>请调整设备备注、型号、IP、设备类型或配电箱</div></div></td></tr>`;

    const cabinetMenu = `
      <div class="cabinet-action-wrap${view.cabinetMenuOpen ? " open" : ""}">
        <button class="reference-action-button cabinet-menu-trigger" type="button" data-action="toggle-cabinet-menu">
          ${icon("cabinet")}<span>配电箱</span><b>⌄</b>
        </button>
        <div class="cabinet-action-menu" role="menu" aria-label="配电箱操作">
          <button type="button" data-action="clear-device-cabinet" role="menuitem"><span class="menu-action-icon clear">${icon("minus")}</span>清除配电箱</button>
          <button type="button" data-action="add-cabinet" role="menuitem"><span class="menu-action-icon create">${icon("plus")}</span>新建配电箱</button>
          <button type="button" data-action="manage-cabinets" role="menuitem"><span class="menu-action-icon manage">${icon("manage")}</span>管理配电箱</button>
          <button type="button" data-action="assign-cabinet" role="menuitem"><span class="menu-action-icon choose">${icon("list")}</span>选择配电箱</button>
        </div>
      </div>`;

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
              ${cabinetMenu}
              <button class="reference-export-button" type="button" data-action="export-devices">${icon("export")}导出</button>
            </div>
          </form>
          <div class="table-wrap device-reference-table-wrap">
            <table class="data-table device-table">
              <colgroup>
                <col style="width:54px"><col style="width:180px"><col style="width:110px"><col style="width:82px"><col style="width:100px"><col style="width:160px"><col style="width:180px"><col style="width:240px"><col style="width:100px"><col style="width:130px"><col style="width:150px">
              </colgroup>
              <thead><tr>
                <th class="checkbox-cell"><input class="table-checkbox" type="checkbox" data-action="select-all-devices"${allPageSelected ? " checked" : ""} aria-label="选择本页全部设备"></th>
                <th>设备备注</th><th>设备类型</th><th>状态</th><th>协议</th><th>型号</th><th>产品名</th><th>设备地址</th><th>连接方式</th><th>所属 IP</th><th>配电箱</th>
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
              <div class="field wide"><select id="historyType"><option value="all">类型 / 全部</option><option value="设备故障"${view.appliedType === "设备故障" ? " selected" : ""}>设备故障</option><option value="应用操作"${view.appliedType === "应用操作" ? " selected" : ""}>应用操作</option><option value="系统操作"${view.appliedType === "系统操作" ? " selected" : ""}>系统操作</option></select></div>
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
    if (entry.type !== "设备故障") return escaped;
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
    return entry.type === "设备故障" && entry.ip ? `${entry.message} IP地址：${entry.ip}` : entry.message;
  }

  function renderPlaceholderPage(page) {
    return `
      <section class="placeholder-page">
        <div><strong>${escapeHtml(pageNames[page] ?? "页面")}</strong>本次 Demo 只实现导航、设备管理内的配电箱操作和历史记录。</div>
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
          <li><strong>已确认：</strong>导航默认组件视图，组件视图按参考截图使用页面树、页面面包屑、全开/全关和不同类型控制组件。</li>
          <li><strong>已确认：</strong>列表视图同样保留全开/全关，对当前筛选结果中的全部组件生效；列表每行对应一个组件。</li>
          <li><strong>已确认：</strong>列表点击“控制”后直接弹出与该组件类型匹配的小组件，在小组件本体内完成开关、调光、空调、窗帘或风机控制。</li>
          <li><strong>已确认：</strong>列表“编辑”和组件视图右上角编辑入口统一进入完整组件编辑页，可编辑组件信息、所属导航节点并预览样式。</li>
          <li><strong>已确认：</strong>设备管理沿用参考页面，新增一个“配电箱”按钮、配电箱下拉筛选，并在列表最后增加“配电箱”列；下拉选择后自动筛选，设备导出包含配电箱字段；配电箱名称文字使用其配置颜色，不增加颜色图标。</li>
          <li><strong>已确认：</strong>配电箱按钮复用标签式 UI，提供清除、新建、管理和选择配电箱；设备直接关联配电箱，设备功能不继承。</li>
          <li><strong>已确认：</strong>新建配电箱使用行内软盘图标保存，底部仅保留关闭；管理列表提供编辑、删除、新增图标，新增会在列表末尾追加可编辑行。</li>
          <li><strong>已确认：</strong>历史记录字段不变，只在设备故障消息内容中增加楼栋、房间、配电箱和 IP 地址；配电箱名称文字使用其配置颜色，不增加颜色图标。</li>
          <li><strong>Demo 假设：</strong>设备按单归属处理，重新关联覆盖旧值；允许多选设备批量关联。</li>
          <li><strong>已确认：</strong>楼栋、房间、配电箱和设备 IP 信息完整时，故障消息按“[楼栋 / 房间 / 配电箱] 原故障内容 IP地址：xxx.xxx.xxx.xxx”显示；任一项缺失时直接沿用原故障字段，不追加定位或 IP，不显示“未配置”且不保留空层级。</li>
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
    state.navigation.editorReturnView = state.navigation.view;
    state.navigation.editorComponentId = component.id;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openAssignCabinetModal() {
    const selectedIds = [...state.devices.selected];
    if (!selectedIds.length) {
      showToast("请先勾选需要关联配电箱的设备", "warning");
      state.devices.cabinetMenuOpen = false;
      render();
      return;
    }
    const activeCabinets = model.cabinets.filter((item) => item.status === "active");
    const firstDevice = model.devices.find((item) => item.id === selectedIds[0]);
    const currentId = selectedIds.length === 1 && firstDevice?.cabinetIds.length === 1 ? firstDevice.cabinetIds[0] : "";
    const options = activeCabinets
      .map(
        (cabinet, index) => `
          <label class="cabinet-option${currentId === cabinet.id ? " selected" : ""}" data-cabinet-option data-keywords="${escapeHtml(`${cabinet.name} ${cabinet.code} ${cabinet.area}`.toLocaleLowerCase("zh-CN"))}">
            <input type="radio" name="cabinetChoice" value="${cabinet.id}"${currentId === cabinet.id ? " checked" : ""}>
            <span class="cabinet-color-dot" style="--cabinet-color:${cabinetUiColor(cabinet, index)}"></span>
            <span class="cabinet-option-main"><strong>${escapeHtml(cabinet.name)}</strong><span>${escapeHtml([cabinet.code, cabinet.area].filter(Boolean).join(" · ") || "配电箱")}</span></span>
            <span class="cabinet-device-count">${model.devices.filter((device) => device.cabinetIds.includes(cabinet.id)).length} 台设备</span>
            <span class="cabinet-option-check">✓</span>
          </label>`,
      )
      .join("");
    state.devices.cabinetMenuOpen = false;
    render();
    openModal({
      title: "选择配电箱",
      large: true,
      body: `
        <div class="cabinet-selection-context">已选择 <strong>${selectedIds.length}</strong> 台设备，请选择需要关联的配电箱</div>
        <div class="cabinet-picker-search">${icon("search")}<input id="cabinetPickerSearch" placeholder="搜索配电箱名称" autocomplete="off"></div>
        <div class="cabinet-picker" id="cabinetPicker">${options || `<div class="empty-state"><div><strong>暂无可选配电箱</strong>请先新建配电箱</div></div>`}</div>
        <div class="cabinet-picker-empty" id="cabinetPickerEmpty" hidden>没有匹配的配电箱，请更换名称搜索</div>
        <div class="form-error" id="cabinetPickerError"></div>`,
      footer: `<button class="button" type="button" data-action="close-modal">取消</button><button class="button primary" type="button" data-action="confirm-assign-cabinet">确认选择</button>`,
    });
  }

  function cabinetUiLevel(cabinet, index = 0) {
    return Number.isFinite(Number(cabinet.uiLevel)) ? Number(cabinet.uiLevel) : 20 + ((index * 11) % 65);
  }

  function cabinetUiColor(cabinet, index = 0) {
    const level = cabinetUiLevel(cabinet, index);
    return `hsl(${318 + Math.round(level * 0.15)} 92% ${56 + Math.round(level * 0.06)}%)`;
  }

  function openCabinetForm(id = null) {
    const cabinet = id ? getCabinet(id) : null;
    const level = cabinetUiLevel(cabinet ?? {}, 0);
    state.devices.cabinetMenuOpen = false;
    render();
    openModal({
      title: cabinet ? "编辑配电箱" : "新增配电箱",
      xlarge: true,
      body: `
        <form id="cabinetForm" data-id="${cabinet?.id ?? ""}">
          <div class="cabinet-save-notice">${icon("info")}<span>数据操作后请及时保存</span></div>
          <div class="cabinet-manage-table-wrap">
            <table class="cabinet-manage-table cabinet-create-reference-table">
              <colgroup><col style="width:15%"><col style="width:34%"><col style="width:31%"><col style="width:20%"></colgroup>
              <thead><tr><th>编号</th><th>颜色</th><th>配电箱名称</th><th>操作</th></tr></thead>
              <tbody><tr class="cabinet-create-reference-row">
                <td>1</td>
                <td>
                  <div class="cabinet-color-editor compact">
                    <span class="cabinet-color-dot" data-cabinet-color-dot style="--cabinet-color:${cabinetUiColor(cabinet ?? {}, 0)}"></span>
                    <input class="cabinet-color-range" id="cabinetColor" type="range" min="0" max="100" value="${level}" data-cabinet-color-preview aria-label="配电箱颜色">
                  </div>
                </td>
                <td><input class="cabinet-name-input" id="cabinetName" value="${escapeHtml(cabinet?.name ?? "")}" maxlength="40" placeholder="请输入配电箱名称" autocomplete="off"><div class="form-error" id="cabinetNameError"></div></td>
                <td>
                  <div class="cabinet-manage-actions">
                    <button class="cabinet-save-action" type="button" data-action="save-cabinet" aria-label="保存配电箱">${icon("save")}</button>
                  </div>
                </td>
              </tr></tbody>
            </table>
          </div>
          <div class="cabinet-manage-footer cabinet-form-footer"><button type="button" data-action="close-modal">关闭</button></div>
        </form>`,
    });
  }

  function saveCabinet() {
    const form = document.getElementById("cabinetForm");
    if (!form) return;
    const id = form.dataset.id || null;
    const name = document.getElementById("cabinetName").value.trim();
    const uiLevel = Number(document.getElementById("cabinetColor").value);
    document.getElementById("cabinetNameError").textContent = "";
    if (!name) {
      document.getElementById("cabinetNameError").textContent = "请输入配电箱名称";
      return;
    }
    let savedCabinet;
    if (id) {
      const cabinet = getCabinet(id);
      Object.assign(cabinet, { name, uiLevel, updatedAt: "2026-08-26 16:36" });
      savedCabinet = cabinet;
      showToast(`已保存配电箱“${name}”`, "success");
    } else {
      savedCabinet = {
        id: `cab-${String(Date.now()).slice(-6)}`,
        name,
        code: "",
        roomId: "",
        area: "",
        remark: "",
        status: "active",
        uiLevel,
        updatedAt: "2026-08-26 16:36",
      };
      model.cabinets.push(savedCabinet);
      form.dataset.id = savedCabinet.id;
      showToast(`已新增配电箱“${name}”`, "success");
    }
    render();
    const saveButton = form.querySelector('[data-action="save-cabinet"]');
    if (saveButton) saveButton.setAttribute("aria-label", `保存 ${name}`);
  }

  function cabinetManagementDraftRowHtml() {
    return `
      <tr class="cabinet-create-reference-row cabinet-management-draft-row">
        <td>${model.cabinets.length + 1}</td>
        <td>
          <div class="cabinet-color-editor compact">
            <span class="cabinet-color-dot" data-cabinet-color-dot style="--cabinet-color:${cabinetUiColor({}, model.cabinets.length)}"></span>
            <input class="cabinet-color-range" id="managementNewCabinetColor" type="range" min="0" max="100" value="${cabinetUiLevel({}, model.cabinets.length)}" data-cabinet-color-preview aria-label="新增配电箱颜色">
          </div>
        </td>
        <td><input class="cabinet-name-input" id="managementNewCabinetName" maxlength="40" placeholder="请输入配电箱名称" autocomplete="off"><div class="form-error" id="managementNewCabinetNameError"></div></td>
        <td>
          <div class="cabinet-manage-actions">
            <button class="cabinet-save-action" type="button" data-action="save-management-cabinet" aria-label="保存新增配电箱">${icon("save")}</button>
          </div>
        </td>
      </tr>`;
  }

  function appendCabinetManagementRow() {
    const existing = document.querySelector(".cabinet-management-draft-row");
    if (existing) {
      existing.scrollIntoView({ block: "nearest" });
      existing.querySelector("#managementNewCabinetName")?.focus();
      return;
    }
    const body = document.getElementById("cabinetManagementBody");
    if (!body) return;
    body.insertAdjacentHTML("beforeend", cabinetManagementDraftRowHtml());
    const row = body.lastElementChild;
    row?.scrollIntoView({ block: "nearest" });
    row?.querySelector("#managementNewCabinetName")?.focus();
  }

  function saveManagementCabinet() {
    const nameInput = document.getElementById("managementNewCabinetName");
    const colorInput = document.getElementById("managementNewCabinetColor");
    const error = document.getElementById("managementNewCabinetNameError");
    const name = nameInput?.value.trim() ?? "";
    if (error) error.textContent = "";
    if (!name) {
      if (error) error.textContent = "请输入配电箱名称";
      nameInput?.focus();
      return;
    }
    model.cabinets.push({
      id: `cab-${String(Date.now()).slice(-6)}`,
      name,
      code: "",
      roomId: "",
      area: "",
      remark: "",
      status: "active",
      uiLevel: Number(colorInput?.value ?? 20),
      updatedAt: "2026-08-26 16:36",
    });
    openCabinetManagementModal();
    showToast(`已新增配电箱“${name}”`, "success");
  }

  function deleteCabinet(id) {
    const cabinet = getCabinet(id);
    if (!cabinet) return;
    model.cabinets = model.cabinets.filter((item) => item.id !== id);
    model.devices.forEach((device) => {
      device.cabinetIds = device.cabinetIds.filter((cabinetId) => cabinetId !== id);
    });
    openCabinetManagementModal();
    showToast(`已删除配电箱“${cabinet.name}”`, "success");
  }

  function openCabinetManagementModal() {
    state.devices.cabinetMenuOpen = false;
    render();
    const rows = model.cabinets
      .map(
        (cabinet, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <div class="cabinet-color-editor compact">
                <span class="cabinet-color-dot" data-cabinet-color-dot="${cabinet.id}" style="--cabinet-color:${cabinetUiColor(cabinet, index)}"></span>
                <input class="cabinet-color-range" type="range" min="0" max="100" value="${cabinetUiLevel(cabinet, index)}" data-cabinet-color="${cabinet.id}" aria-label="${escapeHtml(cabinet.name)}颜色">
              </div>
            </td>
            <td title="${escapeHtml(cabinet.name)}">${escapeHtml(cabinet.name)}</td>
            <td>
              <div class="cabinet-manage-actions">
                <button type="button" data-action="edit-cabinet" data-id="${cabinet.id}" aria-label="编辑 ${escapeHtml(cabinet.name)}">${icon("edit")}</button>
                <button type="button" data-action="request-delete-cabinet" data-id="${cabinet.id}" aria-label="删除 ${escapeHtml(cabinet.name)}">${icon("trash")}</button>
                <button type="button" data-action="append-cabinet-management-row" aria-label="在列表末尾新增配电箱">${icon("plus")}</button>
              </div>
            </td>
          </tr>`,
      )
      .join("");
    openModal({
      title: "管理配电箱",
      xlarge: true,
      body: `
        <div class="cabinet-save-notice">${icon("info")}<span>数据操作后请及时保存</span></div>
        <div class="cabinet-manage-table-wrap">
          <table class="cabinet-manage-table">
            <colgroup><col style="width:15%"><col style="width:34%"><col style="width:31%"><col style="width:20%"></colgroup>
            <thead><tr><th>编号</th><th>颜色</th><th>配电箱名称</th><th>操作</th></tr></thead>
            <tbody id="cabinetManagementBody">${rows}</tbody>
          </table>
        </div>
        <div class="cabinet-manage-footer"><button type="button" data-action="close-modal">关闭</button></div>`,
    });
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
    if (target.matches('[data-action="page-size"]')) {
      const scope = target.dataset.scope;
      if (state[scope]) {
        state[scope].pageSize = Number(target.value);
        state[scope].page = 1;
        render();
      }
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
    if (target.matches('input[name="cabinetChoice"]')) {
      document.querySelectorAll("[data-cabinet-option]").forEach((option) => option.classList.remove("selected"));
      target.closest("[data-cabinet-option]")?.classList.add("selected");
      const error = document.getElementById("cabinetPickerError");
      if (error) error.textContent = "";
    }
    if (target.id === "navType") {
      state.navigation.appliedType = target.value;
      state.navigation.page = 1;
      render();
    }
    if (["historyType", "historyDate"].includes(target.id)) applyHistoryFilter();
    if (["deviceFilterField", "deviceType", "deviceCabinet"].includes(target.id)) applyDeviceFilter();
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "navKeyword") {
      state.navigation.appliedName = target.value.trim();
      state.navigation.page = 1;
      window.clearTimeout(navigationFilterTimer);
      navigationFilterTimer = window.setTimeout(() => {
        render();
        requestAnimationFrame(() => {
          const input = document.getElementById("navKeyword");
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
    if (target.id === "cabinetPickerSearch") {
      const keyword = target.value.trim().toLocaleLowerCase("zh-CN");
      let visibleCount = 0;
      document.querySelectorAll("[data-cabinet-option]").forEach((option) => {
        const visible = !keyword || option.dataset.keywords.includes(keyword);
        option.style.display = visible ? "grid" : "none";
        if (visible) visibleCount += 1;
      });
      const empty = document.getElementById("cabinetPickerEmpty");
      if (empty) empty.hidden = visibleCount > 0;
      return;
    }
    if (target.matches("[data-cabinet-color-preview]")) {
      const dot = target.closest(".cabinet-create-reference-row")?.querySelector("[data-cabinet-color-dot]");
      if (dot) dot.style.setProperty("--cabinet-color", cabinetUiColor({ uiLevel: Number(target.value) }));
      return;
    }
    if (target.matches("[data-cabinet-color]")) {
      const cabinet = getCabinet(target.dataset.cabinetColor);
      if (!cabinet) return;
      cabinet.uiLevel = Number(target.value);
      const dot = document.querySelector(`[data-cabinet-color-dot="${cabinet.id}"]`);
      if (dot) dot.style.setProperty("--cabinet-color", cabinetUiColor(cabinet));
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
    if (!target) {
      if (state.openTree || state.devices.cabinetMenuOpen) {
        state.openTree = null;
        state.devices.cabinetMenuOpen = false;
        render();
      }
      return;
    }
    const action = target.dataset.action;
    if (action === "toggle-cabinet-menu") {
      state.devices.cabinetMenuOpen = !state.devices.cabinetMenuOpen;
      render();
      return;
    }
    if (action === "toggle-tree") {
      state.openTree = state.openTree === target.dataset.scope ? null : target.dataset.scope;
      render();
      return;
    }
    if (action === "set-location") {
      if (target.dataset.scope === "navigation") {
        state.navigation.selectedLocation = target.dataset.location;
        state.navigation.page = 1;
      }
      state.openTree = null;
      render();
      return;
    }
    if (action === "set-nav-view") {
      state.navigation.view = target.dataset.view;
      state.navigation.page = 1;
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
      const isListScope = target.dataset.controlScope === "list";
      const targets = isListScope ? filteredNavigationComponents() : model.components.filter((item) => item.roomId === target.dataset.roomId);
      targets.forEach((component) => {
        component.state = value;
        if (component.controlType === "curtain") {
          component.position = value === "on" ? 100 : 0;
          component.command = value === "on" ? "open" : "close";
        }
      });
      render();
      showToast(`${isListScope ? `当前列表 ${targets.length} 个` : "当前页面"}组件已${value === "on" ? "全开" : "全关"}`, "success");
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
      state.navigation.view = state.navigation.editorReturnView;
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
      state.navigation.view = state.navigation.editorReturnView;
      showToast(`已保存组件“${name}”`, "success");
      render();
      return;
    }
    if (action === "manage-cabinets") {
      openCabinetManagementModal();
      return;
    }
    if (action === "assign-cabinet") {
      openAssignCabinetModal();
      return;
    }
    if (action === "clear-device-selection") {
      state.devices.selected.clear();
      render();
      return;
    }
    if (action === "confirm-assign-cabinet") {
      const selectedCabinet = document.querySelector('input[name="cabinetChoice"]:checked');
      if (!selectedCabinet) {
        document.getElementById("cabinetPickerError").textContent = "请选择一个配电箱";
        return;
      }
      const cabinet = getCabinet(selectedCabinet.value);
      const count = state.devices.selected.size;
      model.devices.forEach((device) => {
        if (state.devices.selected.has(device.id)) device.cabinetIds = [cabinet.id];
      });
      state.devices.selected.clear();
      closeModal();
      render();
      showToast(`已为 ${count} 台设备关联“${cabinet.name}”`, "success");
      return;
    }
    if (action === "clear-device-cabinet") {
      const count = state.devices.selected.size;
      if (!count) {
        state.devices.cabinetMenuOpen = false;
        render();
        showToast("请先勾选需要清除配电箱的设备", "warning");
        return;
      }
      model.devices.forEach((device) => {
        if (state.devices.selected.has(device.id)) device.cabinetIds = [];
      });
      state.devices.selected.clear();
      state.devices.cabinetMenuOpen = false;
      render();
      showToast(`已解除 ${count} 台设备的配电箱关联`, "success");
      return;
    }
    if (action === "export-devices") {
      const rows = filteredDevices().map((device) => {
        const cabinet = displayCabinet(device);
        return [device.remark, device.type, device.status === "online" ? "在线" : "离线", device.protocol, device.model, device.product, device.address, device.connection, device.ip, cabinet?.name ?? ""];
      });
      downloadCsv("设备管理-导出.csv", ["设备备注", "设备类型", "状态", "协议", "型号", "产品名", "设备地址", "连接方式", "所属IP", "配电箱"], rows);
      showToast("已导出当前筛选结果，包含配电箱字段", "success");
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
    if (action === "add-cabinet") {
      openCabinetForm();
      return;
    }
    if (action === "edit-cabinet") {
      openCabinetForm(target.dataset.id);
      return;
    }
    if (action === "request-delete-cabinet") {
      deleteCabinet(target.dataset.id);
      return;
    }
    if (action === "append-cabinet-management-row") {
      appendCabinetManagementRow();
      return;
    }
    if (action === "save-cabinet") {
      saveCabinet();
      return;
    }
    if (action === "save-management-cabinet") {
      saveManagementCabinet();
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
      state.devices.selected.clear();
      state.navigation.editorComponentId = null;
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
      else if (state.openTree || state.devices.cabinetMenuOpen) {
        state.openTree = null;
        state.devices.cabinetMenuOpen = false;
        render();
      }
    }
  });

  window.addEventListener("hashchange", render);

  if (!window.location.hash) {
    window.location.hash = "navigation";
  } else {
    render();
  }
})();
