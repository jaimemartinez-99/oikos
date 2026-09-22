import { supabase, supabaseReady } from './supabase'

export const roomNames = ['Salón','Cocina','Habitación','Baño principal','Baño invitados','Despacho','Terrazas']
export const typeNames = ['Supermercado','Luz','Agua','Internet','Ocio']

const fail = ({ error }) => { if (error) throw error }
export async function loadHousehold() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('NO_SESSION')
  const member = await supabase.from('household_members').select('household_id, display_name, role').eq('user_id', user.id).limit(1).maybeSingle(); fail(member)
  if (!member.data) throw new Error('NO_HOUSEHOLD')
  const householdId = member.data.household_id
  const [members, tickets, items, rooms, furniture, tasks, assignments, types, expenses, notes] = await Promise.all([
    supabase.from('household_members').select('user_id,display_name').eq('household_id', householdId),
    supabase.from('shopping_tickets').select('id,date').eq('household_id', householdId).order('date',{ascending:false}),
    supabase.from('shopping_items').select('id,ticket_id,product_name,quantity,checked,created_at'),
    supabase.from('furniture_rooms').select('id,name').eq('household_id', householdId),
    supabase.from('furniture_items').select('id,room_id,title,url,priority,description,image_url').eq('household_id', householdId),
    supabase.from('tasks').select('id,title,description').eq('household_id', householdId),
    supabase.from('task_assignments').select('id,task_id,assigned_to,date,is_recurring,recurrence_rule,completed'),
    supabase.from('expense_types').select('id,name').eq('household_id', householdId),
    supabase.from('expenses').select('id,type,detail,amount,date,created_by').eq('household_id', householdId).order('date',{ascending:false}),
    supabase.from('household_notes').select('id,content,checked,created_at').eq('household_id', householdId).order('created_at',{ascending:false}),
  ])
  ;[members,tickets,items,rooms,furniture,tasks,assignments,types,expenses].forEach(fail)
  const memberName = Object.fromEntries(members.data.map(x=>[x.user_id,x.display_name]))
  const taskTitle = Object.fromEntries(tasks.data.map(x=>[x.id,x.title]))
  const roomName = Object.fromEntries(rooms.data.map(x=>[x.id,x.name]))
  return { householdId, currentUser:user.id, members:members.data, roomRows:rooms.data, tickets:tickets.data.map(t=>({id:t.id,date:t.date,items:items.data.filter(i=>i.ticket_id===t.id).map(i=>({id:i.id,name:i.product_name,quantity:i.quantity,checked:i.checked}))})), rooms:rooms.data.map(x=>x.name), furniture:furniture.data.map(x=>({id:x.id,room:roomName[x.room_id]||'Sin estancia',title:x.title,url:x.url||'',priority:x.priority,notes:x.description||'',imageUrl:x.image_url||''})), tasks:tasks.data, assignments:assignments.data.map(x=>({id:x.id,taskId:x.task_id,title:taskTitle[x.task_id]||'Tarea',person:memberName[x.assigned_to]||'Sin asignar',date:x.date,isRecurring:x.is_recurring,recurrenceRule:x.recurrence_rule,completed:x.completed})), notes:notes.error?[]:notes.data.map(x=>({id:x.id,content:x.content,checked:x.checked,createdAt:x.created_at})), expenses:expenses.data.map(x=>({id:x.id,type:x.type,detail:x.detail,amount:Number(x.amount),date:x.date,person:memberName[x.created_by]||''})), types:types.data.map(x=>x.name) }
}
export async function ensureCatalogues(householdId) {
  const results = await Promise.all([supabase.from('furniture_rooms').upsert(roomNames.map(name=>({household_id:householdId,name})),{onConflict:'household_id,name'}),supabase.from('expense_types').upsert(typeNames.map(name=>({household_id:householdId,name})),{onConflict:'household_id,name'})])
  results.forEach(fail)
}
const byId = a => new Map(a.map(x=>[x.id,x]))
export async function syncDelta(before, after) {
  if (!supabaseReady || !after.householdId) return
  const householdId = after.householdId, oldTickets=byId(before.tickets), nextTickets=byId(after.tickets)
  for (const t of before.tickets) if (!nextTickets.has(t.id)) await fail(await supabase.from('shopping_tickets').delete().eq('id',t.id))
  for (const t of after.tickets) {
    const old=oldTickets.get(t.id)
    if(!old) { await fail(await supabase.from('shopping_tickets').insert({id:t.id,household_id:householdId,date:t.date,created_by:after.currentUser})); if(t.items.length) await fail(await supabase.from('shopping_items').insert(t.items.map(i=>({id:i.id,ticket_id:t.id,product_name:i.name,quantity:i.quantity,checked:i.checked})))) }
    else { const oi=byId(old.items), ni=byId(t.items); for(const i of old.items) if(!ni.has(i.id)) await fail(await supabase.from('shopping_items').delete().eq('id',i.id)); for(const i of t.items){const prev=oi.get(i.id);if(!prev) await fail(await supabase.from('shopping_items').insert({id:i.id,ticket_id:t.id,product_name:i.name,quantity:i.quantity,checked:i.checked}));else if(prev.checked!==i.checked||prev.quantity!==i.quantity||prev.name!==i.name) await fail(await supabase.from('shopping_items').update({product_name:i.name,quantity:i.quantity,checked:i.checked}).eq('id',i.id))} }
  }
  const oldFurniture=byId(before.furniture), nextFurniture=byId(after.furniture), roomId=Object.fromEntries(after.roomRows.map(x=>[x.name,x.id]))
  for(const x of before.furniture) if(!nextFurniture.has(x.id)) await fail(await supabase.from('furniture_items').delete().eq('id',x.id))
  for(const x of after.furniture) if(!oldFurniture.has(x.id)) await fail(await supabase.from('furniture_items').insert({id:x.id,household_id:householdId,room_id:roomId[x.room],title:x.title,url:x.url||null,priority:x.priority,description:x.notes||null,created_by:after.currentUser}))
  const oldTasks=byId(before.tasks), nextTasks=byId(after.tasks)
  for(const x of before.tasks) if(!nextTasks.has(x.id)) await fail(await supabase.from('tasks').delete().eq('id',x.id))
  for(const x of after.tasks) if(!oldTasks.has(x.id)) await fail(await supabase.from('tasks').insert({id:x.id,household_id:householdId,title:x.title,description:x.description||null}))
  const oldAssignments=byId(before.assignments), nextAssignments=byId(after.assignments), memberId=Object.fromEntries(after.members.map(x=>[x.display_name,x.user_id]))
  for(const x of before.assignments) if(!nextAssignments.has(x.id)) await fail(await supabase.from('task_assignments').delete().eq('id',x.id))
  for(const x of after.assignments){const prev=oldAssignments.get(x.id);if(!prev) await fail(await supabase.from('task_assignments').insert({id:x.id,task_id:x.taskId,assigned_to:memberId[x.person]||null,date:x.date,is_recurring:x.isRecurring||false,recurrence_rule:x.recurrenceRule||null,completed:x.completed}));else if(prev.completed!==x.completed) await fail(await supabase.from('task_assignments').update({completed:x.completed}).eq('id',x.id))}
  const oldExpenses=byId(before.expenses), nextExpenses=byId(after.expenses)
  for(const x of before.expenses) if(!nextExpenses.has(x.id)) await fail(await supabase.from('expenses').delete().eq('id',x.id))
  for(const x of after.expenses) if(!oldExpenses.has(x.id)) await fail(await supabase.from('expenses').insert({id:x.id,household_id:householdId,type:x.type,detail:x.detail,amount:x.amount,date:x.date,created_by:after.currentUser}))
  const oldTypes=new Set(before.types), nextTypes=new Set(after.types)
  for(const name of oldTypes) if(!nextTypes.has(name)) await fail(await supabase.from('expense_types').delete().eq('household_id',householdId).eq('name',name))
  for(const name of nextTypes) if(!oldTypes.has(name)) await fail(await supabase.from('expense_types').insert({household_id:householdId,name}))
  const oldNotes=byId(before.notes||[]), nextNotes=byId(after.notes||[])
  for(const x of before.notes||[]) if(!nextNotes.has(x.id)) await fail(await supabase.from('household_notes').delete().eq('id',x.id))
  for(const x of after.notes||[]){const prev=oldNotes.get(x.id);if(!prev) await fail(await supabase.from('household_notes').insert({id:x.id,household_id:householdId,content:x.content,checked:x.checked,created_by:after.currentUser}));else if(prev.content!==x.content||prev.checked!==x.checked) await fail(await supabase.from('household_notes').update({content:x.content,checked:x.checked}).eq('id',x.id))}
}
