import './style.css'

const storageKey = 'dayboard.tasks'
const statusLabels = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
}
const today = new Date()
const dateAtOffset = (offset) => {
  const date = new Date(today)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}
const starterTasks = [
  { id: 'task-1', title: 'Shape the launch checklist', note: 'Pull the last loose ends into one place.', status: 'todo', priority: 'high', due: dateAtOffset(0), tag: 'Planning' },
  { id: 'task-2', title: 'Send the studio update', note: 'Share the new timeline with the team.', status: 'todo', priority: 'medium', due: dateAtOffset(0), tag: 'Team' },
  { id: 'task-3', title: 'Review homepage copy', note: 'Check the short and long descriptions.', status: 'todo', priority: 'low', due: dateAtOffset(1), tag: 'Writing' },
  { id: 'task-4', title: 'Map the first-run flow', note: 'Keep the handoff clear and lightweight.', status: 'doing', priority: 'high', due: dateAtOffset(0), tag: 'Product' },
  { id: 'task-5', title: 'Collect customer notes', note: 'Add the useful patterns to the research doc.', status: 'doing', priority: 'medium', due: dateAtOffset(2), tag: 'Research' },
  { id: 'task-6', title: 'Tidy the component library', note: 'Remove the old button variants.', status: 'done', priority: 'low', due: dateAtOffset(-1), tag: 'Design' },
]

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey))
    return Array.isArray(savedTasks) ? savedTasks : starterTasks
  } catch {
    return starterTasks
  }
}

let tasks = loadTasks()
let activeView = 'board'
let searchQuery = ''

const app = document.querySelector('#app')
app.innerHTML = `
  <aside class="sidebar">
    <a class="brand" href="#board" aria-label="Dayboard home">
      <span class="brand-mark" aria-hidden="true">d</span>
      <span>dayboard</span>
    </a>
    <div class="workspace-label">WORKSPACE</div>
    <nav class="primary-nav" aria-label="Workspace views">
      <button class="nav-item is-active" type="button" data-view="board">
        <span class="nav-symbol" aria-hidden="true">▦</span><span>My board</span><span class="nav-count" id="open-count">0</span>
      </button>
      <button class="nav-item" type="button" data-view="completed">
        <span class="nav-symbol check-symbol" aria-hidden="true">✓</span><span>Completed</span><span class="nav-count" id="done-count">0</span>
      </button>
    </nav>
    <div class="sidebar-bottom">
      <div class="sidebar-date"><span class="date-dot"></span><span id="sidebar-date"></span></div>
      <div class="profile">
        <span class="avatar" aria-hidden="true">A</span>
        <span class="profile-copy"><strong>Alex Morgan</strong><small>Personal workspace</small></span>
        <span class="profile-more" aria-hidden="true">···</span>
      </div>
    </div>
  </aside>

  <main class="main-panel">
    <header class="topbar">
      <div class="breadcrumb"><span>Workspace</span><span class="crumb-divider">/</span><strong id="view-breadcrumb">My board</strong></div>
      <div class="topbar-actions">
        <label class="search-box">
          <span class="search-icon" aria-hidden="true"></span>
          <span class="sr-only">Search tasks</span>
          <input id="task-search" type="search" placeholder="Search tasks" autocomplete="off" />
          <kbd>/</kbd>
        </label>
        <button class="avatar avatar-small" type="button" aria-label="Account menu">A</button>
      </div>
    </header>

    <section class="content">
      <div class="page-heading">
        <div>
          <p class="eyebrow" id="today-label"></p>
          <h1 id="page-title">A little progress, every day.</h1>
          <p class="page-subtitle" id="page-subtitle">Keep the important things moving.</p>
        </div>
        <button class="primary-button" type="button" data-action="new-task"><span aria-hidden="true">+</span> New task</button>
      </div>

      <div class="board-toolbar">
        <div class="view-switch" role="tablist" aria-label="Task view">
          <button type="button" role="tab" aria-selected="true" class="view-tab is-selected" data-view="board">Board</button>
          <button type="button" role="tab" aria-selected="false" class="view-tab" data-view="completed">Completed</button>
        </div>
        <div class="board-summary"><span class="summary-mark" aria-hidden="true"></span><span id="summary-text"></span></div>
      </div>

      <section id="board" class="board" aria-label="Task board"></section>
      <p class="local-note"><span aria-hidden="true">⌁</span> Your tasks are saved on this device</p>
    </section>
  </main>

  <dialog class="task-dialog" id="task-dialog" aria-labelledby="dialog-title">
    <form id="task-form" method="dialog">
      <div class="dialog-heading">
        <div><p class="eyebrow">MAKE A LITTLE ROOM</p><h2 id="dialog-title">Add a task</h2></div>
        <button class="close-button" type="button" data-action="close-dialog" aria-label="Close dialog">×</button>
      </div>
      <label class="field-label" for="task-title">Task name</label>
      <input class="text-field" id="task-title" name="title" maxlength="100" placeholder="What needs doing?" required />
      <label class="field-label" for="task-note">A few details <span>optional</span></label>
      <textarea class="text-field note-field" id="task-note" name="note" maxlength="180" placeholder="Add a note to future-you"></textarea>
      <div class="field-row">
        <label class="field-label" for="task-priority">Priority
          <select class="select-field" id="task-priority" name="priority"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select>
        </label>
        <label class="field-label" for="task-due">Due date
          <input class="select-field" id="task-due" name="due" type="date" value="${dateAtOffset(0)}" />
        </label>
      </div>
      <label class="field-label" for="task-tag">Label <span>optional</span></label>
      <input class="text-field" id="task-tag" name="tag" maxlength="24" placeholder="e.g. Work, Home" />
      <div class="dialog-actions"><button class="secondary-button" type="button" data-action="close-dialog">Cancel</button><button class="primary-button" type="submit">Add to board</button></div>
    </form>
  </dialog>
`

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function formatDueDate(dateString) {
  if (!dateString) return 'No date'
  const date = new Date(`${dateString}T12:00:00`)
  const todayString = dateAtOffset(0)
  if (dateString === todayString) return 'Today'
  if (dateString === dateAtOffset(1)) return 'Tomorrow'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  } catch {
    document.querySelector('.local-note').textContent = 'Storage is unavailable; changes will last for this session.'
  }
}

function taskCard(task) {
  const overdue = task.due && task.due < dateAtOffset(0) && task.status !== 'done'
  return `
    <article class="task-card priority-${escapeHTML(task.priority)}" data-task-card="${escapeHTML(task.id)}">
      <div class="task-card-top"><span class="priority-label"><span class="priority-dot"></span>${escapeHTML(task.priority)} priority</span><button class="delete-button" type="button" data-action="delete-task" data-id="${escapeHTML(task.id)}" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">×</button></div>
      <h3>${escapeHTML(task.title)}</h3>
      ${task.note ? `<p class="task-note">${escapeHTML(task.note)}</p>` : ''}
      <div class="task-meta"><span class="task-tag">${escapeHTML(task.tag || 'General')}</span><span class="due-date${overdue ? ' is-overdue' : ''}"><span aria-hidden="true">◷</span>${formatDueDate(task.due)}${overdue ? ' · overdue' : ''}</span></div>
      <label class="sr-only" for="move-${escapeHTML(task.id)}">Move ${escapeHTML(task.title)}</label>
      <select class="move-select" id="move-${escapeHTML(task.id)}" data-action="move-task" data-id="${escapeHTML(task.id)}" aria-label="Move ${escapeHTML(task.title)}">
        ${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${task.status === value ? 'selected' : ''}>${label}</option>`).join('')}
      </select>
    </article>
  `
}

function renderBoard() {
  const openTasks = tasks.filter((task) => task.status !== 'done').length
  const doneTasks = tasks.filter((task) => task.status === 'done').length
  document.querySelector('#open-count').textContent = openTasks
  document.querySelector('#done-count').textContent = doneTasks
  document.querySelector('#view-breadcrumb').textContent = activeView === 'completed' ? 'Completed' : 'My board'
  document.querySelector('#page-title').textContent = activeView === 'completed' ? 'Look how far you have come.' : 'A little progress, every day.'
  document.querySelector('#page-subtitle').textContent = activeView === 'completed' ? 'Finished tasks, all in one place.' : 'Keep the important things moving.'
  document.querySelectorAll('[data-view]').forEach((button) => {
    const selected = button.dataset.view === activeView
    button.classList.toggle('is-active', selected && button.classList.contains('nav-item'))
    button.classList.toggle('is-selected', selected && button.classList.contains('view-tab'))
    if (button.classList.contains('view-tab')) button.setAttribute('aria-selected', String(selected))
  })

  const visibleTasks = tasks.filter((task) => {
    const matchesView = activeView === 'completed' ? task.status === 'done' : task.status !== 'done'
    const haystack = `${task.title} ${task.note} ${task.tag}`.toLowerCase()
    return matchesView && haystack.includes(searchQuery.toLowerCase())
  })
  const visibleTotal = visibleTasks.length
  document.querySelector('#summary-text').textContent = `${visibleTotal} ${visibleTotal === 1 ? 'task' : 'tasks'} ${activeView === 'completed' ? 'completed' : 'on your board'}`

  const statuses = activeView === 'completed' ? ['done'] : ['todo', 'doing', 'done']
  document.querySelector('#board').innerHTML = statuses.map((status) => {
    const columnTasks = visibleTasks.filter((task) => task.status === status)
    return `
      <section class="board-column column-${status}" aria-labelledby="heading-${status}">
        <header class="column-heading"><div class="column-title"><span class="column-indicator"></span><h2 id="heading-${status}">${statusLabels[status]}</h2><span class="column-count">${columnTasks.length}</span></div>${status === 'todo' ? '<button class="add-inline" type="button" data-action="new-task" aria-label="Add a task">+</button>' : ''}</header>
        <div class="column-cards">${columnTasks.length ? columnTasks.map(taskCard).join('') : `<div class="empty-column">${searchQuery ? 'No matching tasks' : status === 'done' ? 'Finished tasks land here.' : 'A clear little space.'}</div>`}</div>
      </section>
    `
  }).join('')
}

const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(today)
document.querySelector('#today-label').textContent = dateLabel.toUpperCase()
document.querySelector('#sidebar-date').textContent = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(today)
renderBoard()

app.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]')
  if (viewButton) {
    activeView = viewButton.dataset.view
    renderBoard()
    return
  }

  const actionButton = event.target.closest('[data-action]')
  if (!actionButton) return

  if (actionButton.dataset.action === 'new-task') {
    document.querySelector('#task-dialog').showModal()
    document.querySelector('#task-title').focus()
  }
  if (actionButton.dataset.action === 'close-dialog') document.querySelector('#task-dialog').close()
  if (actionButton.dataset.action === 'delete-task') {
    tasks = tasks.filter((task) => task.id !== actionButton.dataset.id)
    saveTasks()
    renderBoard()
  }
})

app.addEventListener('input', (event) => {
  if (event.target.id !== 'task-search') return
  searchQuery = event.target.value.trim()
  renderBoard()
})

app.addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'move-task') return
  const task = tasks.find((item) => item.id === event.target.dataset.id)
  if (!task) return
  task.status = event.target.value
  saveTasks()
  renderBoard()
})

document.querySelector('#task-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const title = String(formData.get('title') || '').trim()
  if (!title) return
  tasks.unshift({
    id: `task-${crypto.randomUUID()}`,
    title,
    note: String(formData.get('note') || '').trim(),
    status: 'todo',
    priority: String(formData.get('priority') || 'medium'),
    due: String(formData.get('due') || ''),
    tag: String(formData.get('tag') || '').trim(),
  })
  saveTasks()
  event.currentTarget.reset()
  document.querySelector('#task-due').value = dateAtOffset(0)
  document.querySelector('#task-dialog').close()
  activeView = 'board'
  renderBoard()
})

document.querySelector('#task-search').addEventListener('keydown', (event) => {
  if (event.key === '/') event.preventDefault()
})
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault()
    document.querySelector('#task-search').focus()
  }
})
