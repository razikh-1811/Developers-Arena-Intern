/* blog.js — Local Storage CRUD for posts (simple, dependency-free) */

const STORAGE_KEY = "charan_blog_posts_v1";

const $ = id => document.getElementById(id);
const form = $("post-form");
const postsEl = $("posts");
const emptyEl = $("empty");
const searchEl = $("search");
const sortEl = $("sort");
const clearAllBtn = $("clear-all");
const cancelEditBtn = $("cancel-edit");
const formTitle = $("form-title");

function nowISO(){ return new Date().toISOString(); }
function loadPosts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ console.error("loadPosts", e); return [] }
}
function savePosts(posts){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }catch(e){ console.error("savePosts", e) }
}

/* Render list (with simple search & sort) */
function render(){
  const q = (searchEl.value || "").trim().toLowerCase();
  let posts = loadPosts();

  // sort
  const sort = (sortEl && sortEl.value) || "new";
  if(sort === "new") posts.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
  else if(sort === "old") posts.sort((a,b)=> a.createdAt.localeCompare(b.createdAt));
  else if(sort === "title") posts.sort((a,b)=> a.title.localeCompare(b.title));

  // filter
  if(q) posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.tags||"").toLowerCase().includes(q));

  postsEl.innerHTML = "";
  if(posts.length === 0){ emptyEl.style.display = "block"; return; } else { emptyEl.style.display = "none"; }

  posts.forEach(post => {
    const li = document.createElement("li");
    li.className = "post-item";
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div style="flex:1">
          <p class="post-title">${escapeHtml(post.title)}</p>
          <div class="post-meta">Posted: ${new Date(post.createdAt).toLocaleString()} ${post.tags? "• Tags: "+escapeHtml(post.tags):""}</div>
          <p class="post-content">${escapeHtml(post.content)}</p>
        </div>
        <div class="post-actions">
          <button class="action" data-action="edit" data-id="${post.id}">Edit</button>
          <button class="action" data-action="delete" data-id="${post.id}">Delete</button>
        </div>
      </div>
    `;
    postsEl.appendChild(li);
  });
}

/* create or update on submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("post-id").value;
  const title = $("title").value.trim();
  const content = $("content").value.trim();
  const tags = $("tags").value.trim();

  if(!title || !content){ alert("Please add a title and content."); return; }

  let posts = loadPosts();
  if(id){
    const i = posts.findIndex(p => p.id === id);
    if(i >= 0){
      posts[i].title = title;
      posts[i].content = content;
      posts[i].tags = tags;
      posts[i].updatedAt = nowISO();
    }
  } else {
    const post = { id: "p_"+Date.now(), title, content, tags, createdAt: nowISO(), updatedAt:null };
    posts.push(post);
  }

  savePosts(posts);
  form.reset();
  resetFormState();
  render();
});

/* delegate edit/delete buttons */
postsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if(action === "delete"){
    if(!confirm("Delete this post?")) return;
    let posts = loadPosts();
    posts = posts.filter(p => p.id !== id);
    savePosts(posts);
    render();
  } else if(action === "edit"){
    const posts = loadPosts();
    const post = posts.find(p => p.id === id);
    if(!post) return;
    $("post-id").value = post.id;
    $("title").value = post.title;
    $("content").value = post.content;
    $("tags").value = post.tags || "";
    formTitle.textContent = "Edit Post";
    cancelEditBtn.hidden = false;
    cancelEditBtn.focus();
  }
});

/* clear all */
clearAllBtn.addEventListener("click", () => {
  if(!confirm("Clear all posts? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

/* search & sort live */
searchEl.addEventListener("input", render);
sortEl && sortEl.addEventListener("change", render);

/* cancel edit */
cancelEditBtn.addEventListener("click", () => { form.reset(); resetFormState(); });

function resetFormState(){
  $("post-id").value = "";
  formTitle.textContent = "Create Post";
  cancelEditBtn.hidden = true;
}

/* small helper: escape HTML to avoid injection in this simple app */
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#39;");
}

/* init */
(function init(){
  // ensure year in footer (small convenience)
  const yr = document.getElementById("year");
  if(yr) yr.textContent = new Date().getFullYear();

  render();
})();
