/* ALISTA AHORRO v53 ofertas relampago fix
   Código de aplicación separado del HTML.
   No poner service_role keys ni contraseñas en este archivo. */
'use strict';
// V21 Seguridad: Supabase Auth + RLS. No usar sin ejecutar el SQL de seguridad.
var R=React;
var {useState,useEffect,useRef,useCallback}=R;
var E=R.createElement;

/* ═══════════════════════════
   CONSTANTS
═══════════════════════════ */
var ADMIN_DEF={id:'root',username:'ADMINISTRADOR',nombre:'Alejandro',role:'admin',activo:true,permisos:{max_desc:10,desc_deshabilitado:false}};
var BIZ={nombre:'ALISTA AHORRO',dir:'Calle Jujuy s/n B° Centro entre calle Sarmiento y Av. San Martín, Los Juríes',tel:'3857476927',wa:'3857476927',instagram:'ALISTA AHORRO',sucursal:''};
var LOS_JURIOS=[-28.466,-62.096];

var DEMO_ARTS=[
  {id:'a1',cod:'ART001',codArt:'P001',desc:'Arroz integral 5 kg',precio:2500,costo:1800,estado:'activo'},
  {id:'a2',cod:'ART002',codArt:'P002',desc:'Aceite vegetal 1 L',precio:1800,costo:1200,estado:'activo'},
  {id:'a3',cod:'ART003',codArt:'P003',desc:'Harina de trigo 1 kg',precio:900,costo:600,estado:'activo'},
  {id:'a4',cod:'ART004',codArt:'P004',desc:'Azúcar blanca 1 kg',precio:1200,costo:850,estado:'activo'},
  {id:'a5',cod:'ART005',codArt:'P005',desc:'Sal fina 500 g',precio:450,costo:280,estado:'activo'},
];

var DEMO_CLIS=[
  {id:'c1',nombre:'Almacén Central',apellido:'Los Andes',dir:'Av. Principal 123',tel:'424500',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.464,lng:-62.092},
  {id:'c2',nombre:'Supermercado',apellido:'Don Carlos',dir:'Calle 9 de Julio 456',tel:'425600',tipoCC:'Con Tope',limCC:50000,deuda:0,estado:'activo',lat:-28.471,lng:-62.099},
  {id:'c3',nombre:'Almacén',apellido:'El Progreso',dir:'San Martín 789',tel:'426100',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.460,lng:-62.088},
  {id:'c4',nombre:'Distribuidora',apellido:'Norte',dir:'Belgrano 321',tel:'427200',tipoCC:'Con Tope',limCC:30000,deuda:0,estado:'activo',lat:-28.474,lng:-62.103},
  {id:'c5',nombre:'Kiosco',apellido:'La Esquina',dir:'Rivadavia 654',tel:'428300',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.468,lng:-62.094},
  {id:'c6',nombre:'Almacén',apellido:'Santa Rosa',dir:'Tucumán 987',tel:'429400',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.455,lng:-62.086},
  {id:'c7',nombre:'Super',apellido:'Los Juríes',dir:'Córdoba 111',tel:'430500',tipoCC:'Con Tope',limCC:80000,deuda:0,estado:'activo',lat:-28.479,lng:-62.107},
  {id:'c8',nombre:'Despensa',apellido:'El Sol',dir:'Salta 222',tel:'431600',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.461,lng:-62.101},
  {id:'c9',nombre:'Almacén',apellido:'La Paz',dir:'Entre Ríos 333',tel:'432700',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.472,lng:-62.085},
  {id:'c10',nombre:'Kiosco',apellido:'Del Centro',dir:'Mendoza 444',tel:'433800',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:-28.466,lng:-62.097},
];

var DEMO_USERS=[
  {id:'u1',nombre:'Carlos Gómez',username:'carlos',role:'preventista',activo:true},
  {id:'u2',nombre:'María López',username:'maria',role:'preventista',activo:true},
  {id:'u3',nombre:'Roberto Díaz',username:'roberto',role:'preparador',activo:true},
];

/* ═══════════════════════════
   SUPABASE CONFIG
═══════════════════════════ */
var SB_URL=(window.ALISTA_CONFIG&&window.ALISTA_CONFIG.SB_URL)||'https://uteibukgbhsqrgkbhsxu.supabase.co';
var SB_KEY=(window.ALISTA_CONFIG&&window.ALISTA_CONFIG.SB_KEY)||'sb_publishable_sJW1HnfuLap8tRTY1i9C-w__XsoYORx';

/* ═══════════════════════════
   SUPABASE AUTH — sesión real
   Importante: la seguridad real queda en Supabase RLS.
═══════════════════════════ */
var AUTH_STORE='alista_auth_session_v21';

// Alias de usuario -> email de Supabase Auth.
// Esto NO guarda contraseñas. Solo permite entrar escribiendo nombres cortos como CR1 o CrisL.
var AUTH_LOGIN_ALIASES={
  'administrador':'administrador@alista.internal',
  'admin':'administrador@alista.internal',
  'root':'administrador@alista.internal',
  'crisl':'carlos@alista.internal',
  'carlos':'carlos@alista.internal',
  'cr1':'roberto@alista.internal',
  'roberto':'roberto@alista.internal'
};
function authEmailFromUsername(username){
  var raw=String(username||'').trim();
  var v=raw.toLowerCase().replace(/\s+/g,'');
  if(v.indexOf('@')>=0)return v;
  if(AUTH_LOGIN_ALIASES[v])return AUTH_LOGIN_ALIASES[v];
  return v+'@alista.internal';
}
function getAuthSession(){
  try{return JSON.parse(localStorage.getItem(AUTH_STORE)||'null');}catch(e){return null;}
}
function saveAuthSession(sess){
  try{localStorage.setItem(AUTH_STORE,JSON.stringify(sess));}catch(e){}
}
function clearAuthSession(){
  try{localStorage.removeItem(AUTH_STORE);}catch(e){}
}
function authIsExpired(sess){
  if(!sess||!sess.expires_at)return false;
  return (Date.now()/1000)>(sess.expires_at-60);
}
function authRefreshSession(sess){
  if(!sess||!sess.refresh_token)return Promise.resolve(null);
  return fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{
    method:'POST',
    headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({refresh_token:sess.refresh_token})
  }).then(function(r){
    if(!r.ok)throw new Error('Sesión vencida');
    return r.json();
  }).then(function(newSess){
    saveAuthSession(newSess);
    return newSess;
  }).catch(function(){clearAuthSession();return null;});
}
function ensureAuthSession(){
  var sess=getAuthSession();
  if(!sess)return Promise.resolve(null);
  if(authIsExpired(sess))return authRefreshSession(sess);
  return Promise.resolve(sess);
}
function authLogin(username,password){
  var email=authEmailFromUsername(username);
  return fetch(SB_URL+'/auth/v1/token?grant_type=password',{
    method:'POST',
    headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({email:email,password:password})
  }).then(function(r){
    if(!r.ok){return r.json().catch(function(){return {};}).then(function(j){throw new Error(j.error_description||j.msg||'Usuario o contraseña incorrectos.');});}
    return r.json();
  }).then(function(sess){
    saveAuthSession(sess);
    return authLoadProfile(sess);
  }).catch(function(e){clearAuthSession();throw e;});
}
function authLoadProfile(sess){
  if(!sess||!sess.user||!sess.user.id)return Promise.resolve(null);
  return sbFetch('usuarios?auth_user_id=eq.'+encodeURIComponent(sess.user.id)+'&activo=eq.true&select=*')
    .then(function(r){
      if(!r.ok){throw new Error('No se pudo leer el perfil del usuario.');}
      return r.json();
    })
    .then(function(rows){
      if(!rows||!rows.length){
        throw new Error('Tu usuario existe en Supabase Auth, pero no está vinculado al perfil de la app. Pedile al administrador que revise la tabla usuarios.');
      }
      return dbToUser(rows[0]);
    });
}
function authRestore(){
  return ensureAuthSession().then(function(sess){
    if(!sess)return null;
    return authLoadProfile(sess).catch(function(){clearAuthSession();return null;});
  });
}
function authLogout(){
  var sess=getAuthSession();
  clearAuthSession();
  if(!sess||!sess.access_token)return Promise.resolve(true);
  return fetch(SB_URL+'/auth/v1/logout',{
    method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+sess.access_token}
  }).catch(function(){return true;});
}

function sbFetch(path,opts){
  return ensureAuthSession().then(function(sess){
    var url=SB_URL+'/rest/v1/'+path;
    var token=sess&&sess.access_token?sess.access_token:SB_KEY;
    var headers=Object.assign({
      'apikey':SB_KEY,
      'Authorization':'Bearer '+token,
      'Content-Type':'application/json',
      'Prefer':'return=representation'
    },opts&&opts.headers||{});
    return fetch(url,Object.assign({},opts,{headers:headers}));
  });
}

// GET all rows from a table (paginado)
// Supabase/PostgREST devuelve como máximo 1000 filas por pedido si no se pagina.
// Si el Excel tiene más de 1000 artículos, sin esto la app carga solo una parte
// y por eso algunas búsquedas como "COCA" no aparecen aunque estén en la base.
function dbGet(table){
  var pageSize=1000;
  var from=0;
  var all=[];
  function nextPage(){
    return sbFetch(table+'?select=*',{
      headers:{'Range-Unit':'items','Range':from+'-'+(from+pageSize-1)}
    }).then(function(r){
      if(!r.ok){
        return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,120));});
      }
      return r.json();
    }).then(function(rows){
      if(!Array.isArray(rows))return all;
      all=all.concat(rows);
      if(rows.length===pageSize){from+=pageSize;return nextPage();}
      return all;
    });
  }
  return nextPage().catch(function(e){console.error('dbGet '+table,e);return all;});
}

// GET liviano: permite seleccionar solo columnas necesarias para pantallas rápidas.
// Se usa especialmente en Clientes/Nuevo Pedido para no traer fotos/base64 ni campos pesados.
function dbGetSelect(table,select,opts){
  opts=opts||{};
  var pageSize=opts.pageSize||1000;
  var from=0;
  var all=[];
  var query=table+'?select='+encodeURIComponent(select||'*');
  if(opts.filter)query+='&'+opts.filter;
  if(opts.order)query+='&order='+encodeURIComponent(opts.order);
  if(opts.limit)query+='&limit='+parseInt(opts.limit,10);
  function nextPage(){
    return sbFetch(query,{headers:{'Range-Unit':'items','Range':from+'-'+(from+pageSize-1)}})
      .then(function(r){
        if(!r.ok)return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,120));});
        return r.json();
      }).then(function(rows){
        if(!Array.isArray(rows))return all;
        all=all.concat(rows);
        if(!opts.limit&&rows.length===pageSize){from+=pageSize;return nextPage();}
        return all;
      });
  }
  return nextPage().catch(function(e){console.error('dbGetSelect '+table,e);return all;});
}

var CLIENT_SELECT_LIGHT='id,nombre,apellido,nombre_fantasia,dir,tel,tipo_cc,lim_cc,deuda,estado,lat,lng,activo,inhabilitado,created_at,updated_at';
function dbGetClientesLight(){
  return dbGetSelect('clientes',CLIENT_SELECT_LIGHT,{order:'nombre.asc',pageSize:1000});
}
function dbSearchClientes(term){
  term=String(term||'').trim();
  if(term.length<2)return Promise.resolve([]);
  var clean=term.replace(/[(),]/g,' ');
  var pat=encodeURIComponent('*'+clean+'*');
  var or='(nombre.ilike.'+pat+',apellido.ilike.'+pat+',nombre_fantasia.ilike.'+pat+',tel.ilike.'+pat+',dir.ilike.'+pat+')';
  return sbFetch('clientes?select='+encodeURIComponent(CLIENT_SELECT_LIGHT)+'&or='+or+'&limit=80')
    .then(function(r){if(!r.ok)return [];return r.json();})
    .catch(function(){return [];});
}


// Search server-side in Supabase. Useful when the local list is incomplete or very large.
function dbSearchArticulos(term){
  term=String(term||'').trim();
  if(term.length<2)return Promise.resolve([]);
  var ART_SELECT_LIGHT='id,cod,cod_art,descripcion,precio,costo,estado,pesable';
  function one(t){
    var clean=String(t||'').trim().replace(/[(),]/g,' ');
    if(clean.length<2)return Promise.resolve([]);
    var pat=encodeURIComponent('*'+clean+'*');
    var path='articulos?select='+encodeURIComponent(ART_SELECT_LIGHT)+'&or=(descripcion.ilike.'+pat+',cod.ilike.'+pat+',cod_art.ilike.'+pat+')&limit=120';
    return sbFetch(path).then(function(r){
      if(!r.ok)return [];
      return r.json();
    }).catch(function(){return [];});
  }
  return one(term).then(function(rows){
    if(rows&&rows.length)return rows;
    var nt=normTxt(term);
    if(nt.length>=4)return one(nt.slice(0,3));
    return rows||[];
  });
}

function dbDeleteAllArticulos(){
  return sbFetch('articulos?id=not.is.null',{method:'DELETE',headers:{'Prefer':'return=minimal'}}).then(function(r){
    if(!r.ok){return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,160));});}
    return true;
  });
}

// Controla ofertas al importar lista nueva.
// No borra ofertas: puede pausarlas, vincularlas con los artículos nuevos y actualizar precios
// manteniendo el margen en pesos entre costo anterior y precio de oferta.
function dbControlarOfertasConNuevaLista(nuevos,pausar){
  function key(v){return normTxt(String(v||''));}
  function idxArticulos(arts){
    var byCod={},byCodArt={},byDesc={};
    (arts||[]).forEach(function(a){
      if(a.cod)byCod[key(a.cod)]=a;
      if(a.codArt)byCodArt[key(a.codArt)]=a;
      if(a.desc)byDesc[key(a.desc)]=a;
    });
    return {byCod:byCod,byCodArt:byCodArt,byDesc:byDesc};
  }
  var idx=idxArticulos(nuevos||[]);
  function buscarArticulo(o){
    return (o.cod&&idx.byCod[key(o.cod)])||(o.codArt&&idx.byCodArt[key(o.codArt)])||(o.descripcion&&idx.byDesc[key(o.descripcion)])||null;
  }
  return dbGet('ofertas_preventistas').then(function(rows){
    var ofertas=(Array.isArray(rows)?rows:[]).map(dbToOferta);
    var actualizadas=0,coincidencias=0,pausadas=0,ajustadas=0,dudosas=0;
    var tareas=ofertas.map(function(o){
      var art=buscarArticulo(o);
      var data={updated_at:(new Date()).toISOString()};
      if(pausar&&o.activo!==false){data.activo=false;pausadas++;}
      if(art){
        coincidencias++;
        var viejoCosto=parseFloat(o.costo)||0;
        var viejaOferta=parseFloat(o.precioOferta)||0;
        var nuevoCosto=parseFloat(art.costo)||0;
        var margen=(viejaOferta>0&&viejoCosto>0)?(viejaOferta-viejoCosto):0;
        var nuevoOferta=viejaOferta;
        if(viejaOferta>0&&nuevoCosto>0){
          nuevoOferta=nuevoCosto+Math.max(0,margen);
          if(nuevoOferta<nuevoCosto)nuevoOferta=nuevoCosto;
          if(Math.abs(nuevoOferta-viejaOferta)>0.009)ajustadas++;
        }
        Object.assign(data,{
          articulo_id:art.id,
          cod:art.cod||o.cod||'',
          cod_art:art.codArt||o.codArt||'',
          descripcion:art.desc||o.descripcion||'',
          precio_regular:parseFloat(art.precio)||parseFloat(o.precioRegular)||0,
          costo:nuevoCosto||viejoCosto||0,
          precio_oferta:nuevoOferta||viejaOferta||0,
          coincidencia_dudosa:false,
          estado_revision:'ok',
          revision_motivo:'Coincidencia encontrada en la nueva lista.'
        });
      }else{
        dudosas++;
        Object.assign(data,{
          coincidencia_dudosa:true,
          estado_revision:'revisar',
          revision_motivo:'Coincidencia dudosa: no se encontró este artículo en la lista nueva. Revisar antes de reactivar la oferta.',
          mostrar_flyer:false
        });
      }
      if(Object.keys(data).length<=1)return Promise.resolve(null);
      actualizadas++;
      return dbUpdate('ofertas_preventistas',o.id,data);
    });
    return Promise.all(tareas).then(function(){return {ok:true,count:actualizadas,coincidencias:coincidencias,pausadas:pausadas,ajustadas:ajustadas,dudosas:dudosas};});
  }).catch(function(e){
    console.warn('dbControlarOfertasConNuevaLista',e);
    return {ok:false,error:e};
  });
}

function dbInsertArticulosBatch(arts,onProgress){
  var rows=arts.map(artToDb);
  var size=400;
  var i=0;
  function next(){
    if(i>=rows.length)return Promise.resolve(true);
    var chunk=rows.slice(i,i+size);
    return sbFetch('articulos',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify(chunk)}).then(function(r){
      if(!r.ok){return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,220));});}
      i+=chunk.length;
      if(onProgress)onProgress(i,rows.length);
      return next();
    });
  }
  return next();
}

// GET single row by id
function dbGetOne(table,id){
  return sbFetch(table+'?id=eq.'+encodeURIComponent(id)+'&select=*')
    .then(function(r){return r.json();}).then(function(rows){return rows[0]||null;}).catch(function(){return null;});
}

// UPSERT (insert or update)
function dbUpsert(table,row){
  return sbFetch(table,{
    method:'POST',
    headers:{'Prefer':'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify(row)
  }).then(function(r){
    if(!r.ok){
      return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,120));});
    }
    return r.json();
  }).catch(function(e){console.error('dbUpsert '+table,e);throw e;});
}

// DELETE by id
function dbDelete(table,id){
  return sbFetch(table+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'}).catch(function(e){console.error('dbDelete',e);});
}

// DELETE with a custom filter query, used only for controlled admin cleanup actions
function dbDeleteWhere(table,query){
  return sbFetch(table+'?'+query,{method:'DELETE',headers:{'Prefer':'return=representation'}})
    .then(function(r){
      if(!r.ok){return r.text().then(function(t){throw new Error('HTTP '+r.status+': '+t.slice(0,160));});}
      return r.json().catch(function(){return [];});
    })
    .catch(function(e){console.error('dbDeleteWhere '+table,e);throw e;});
}

// UPDATE single field
function dbUpdate(table,id,data){
  return sbFetch(table+'?id=eq.'+encodeURIComponent(id),{
    method:'PATCH',
    body:JSON.stringify(data)
  }).then(function(r){return r.json();}).catch(function(e){console.error('dbUpdate',e);return null;});
}

// Map app article object → DB row
function boolPesable(v){var x=normTxt(v);return v===true||x==='si'||x==='sí'||x==='s'||x==='true'||x==='verdadero'||x==='yes'||x==='y'||x==='1'||x==='x'||x==='kg'||x==='kilo'||x==='kilos'||x==='pesable'||x==='balanza'||x==='por kg';}
function artToDb(a){return {id:a.id,cod:a.cod,cod_art:a.codArt||'',descripcion:a.desc,precio:a.precio||0,costo:a.costo||0,estado:a.estado||'activo',pesable:!!a.pesable};}
function dbToArt(r){return {id:r.id,cod:r.cod,codArt:r.cod_art||'',desc:r.descripcion,precio:parseFloat(r.precio)||0,costo:parseFloat(r.costo)||0,estado:r.estado,pesable:!!r.pesable};}

// Map app client object → DB row
function cliToDb(c){return {id:c.id,nombre:c.nombre,apellido:c.apellido,nombre_fantasia:c.nombreFantasia||null,dir:c.dir||'',tel:c.tel||'',tipo_cc:c.tipoCC||'Sin Tope',lim_cc:c.limCC||0,deuda:c.deuda||0,estado:c.estado||'activo',lat:c.lat||null,lng:c.lng||null,fotos:c.fotos||[]};}
function dbToCli(r){var estado=r.estado||((r.activo===false||r.inhabilitado===true)?'inactivo':'activo');return {id:r.id,nombre:r.nombre||'',apellido:r.apellido||'',nombreFantasia:r.nombre_fantasia||'',dir:r.dir||r.direccion||'',tel:r.tel||r.telefono||'',tipoCC:r.tipo_cc||r.tipo_cuenta_corriente||'Sin Tope',limCC:parseFloat(r.lim_cc||r.limite_cc)||0,deuda:parseFloat(r.deuda)||0,estado:estado,lat:r.lat||r.latitud||r.gps_lat,lng:r.lng||r.longitud||r.gps_lng,fotos:r.fotos||[]};}

// Map app user → DB row
function userToDb(u){return {id:u.id,auth_user_id:u.authUserId||u.auth_user_id||null,email:u.email||null,username:u.username,nombre:u.nombre,role:u.role,activo:u.activo!==false,permisos:u.permisos||{}};}
function dbToUser(r){return {id:r.id,authUserId:r.auth_user_id||null,email:r.email||'',username:r.username,nombre:r.nombre,role:r.role,activo:r.activo,permisos:r.permisos||{}};}

// Objetivos simples del preventista
function objToDb(o){return {
  id:o.id,usuario_id:o.usuarioId||o.usuario_id,usuario_nombre:o.usuarioNombre||o.usuario_nombre||'',
  fecha_desde:o.fechaDesde||o.fecha_desde,fecha_hasta:o.fechaHasta||o.fecha_hasta,
  objetivo_visitas:parseFloat(o.objetivoVisitas||o.objetivo_visitas)||0,
  objetivo_pedidos:parseFloat(o.objetivoPedidos||o.objetivo_pedidos)||0,
  objetivo_ventas:parseFloat(o.objetivoVentas||o.objetivo_ventas)||0,
  objetivo_cobranza:parseFloat(o.objetivoCobranza||o.objetivo_cobranza)||0,
  activo:o.activo!==false
};}
function dbToObj(r){return {
  id:r.id,usuarioId:r.usuario_id,usuarioNombre:r.usuario_nombre||'',
  fechaDesde:r.fecha_desde,fechaHasta:r.fecha_hasta,
  objetivoVisitas:parseFloat(r.objetivo_visitas)||0,
  objetivoPedidos:parseFloat(r.objetivo_pedidos)||0,
  objetivoVentas:parseFloat(r.objetivo_ventas)||0,
  objetivoCobranza:parseFloat(r.objetivo_cobranza)||0,
  activo:r.activo!==false
};}


// Ofertas para preventistas + importación segura
function ofertaToDb(o){return {
  id:o.id,
  articulo_id:o.articuloId||o.articulo_id||'',
  cod:o.cod||'',
  cod_art:o.codArt||o.cod_art||'',
  descripcion:o.descripcion||o.desc||'',
  precio_regular:parseFloat(o.precioRegular||o.precio_regular)||0,
  precio_oferta:parseFloat(o.precioOferta||o.precio_oferta)||0,
  costo:parseFloat(o.costo)||0,
  fecha_desde:o.fechaDesde||o.fecha_desde,
  fecha_hasta:o.fechaHasta||o.fecha_hasta||null,
  stock_info:o.stockInfo||o.stock_info||'',
  observacion:o.observacion||'',
  foto_url:o.fotoUrl||o.foto_url||'',
  mostrar_flyer:o.mostrarFlyer!==false,
  mostrar_precio_anterior:o.mostrarPrecioAnterior!==false,
  mostrar_vigencia:o.mostrarVigencia!==false,
  orden_flyer:parseInt(o.ordenFlyer||o.orden_flyer)||0,
  activo:o.activo!==false,
  created_by:o.createdBy||o.created_by||'',
  coincidencia_dudosa:o.coincidenciaDudosa===true||o.coincidencia_dudosa===true,
  estado_revision:o.estadoRevision||o.estado_revision||'ok',
  revision_motivo:o.revisionMotivo||o.revision_motivo||''
};}
function dbToOferta(r){return {
  id:r.id,
  articuloId:r.articulo_id||'',
  cod:r.cod||'',
  codArt:r.cod_art||'',
  descripcion:r.descripcion||'',
  precioRegular:parseFloat(r.precio_regular)||0,
  precioOferta:parseFloat(r.precio_oferta)||0,
  costo:parseFloat(r.costo)||0,
  fechaDesde:r.fecha_desde||'',
  fechaHasta:r.fecha_hasta||'',
  stockInfo:r.stock_info||'',
  observacion:r.observacion||'',
  fotoUrl:r.foto_url||'',
  mostrarFlyer:r.mostrar_flyer!==false,
  mostrarPrecioAnterior:r.mostrar_precio_anterior!==false,
  mostrarVigencia:r.mostrar_vigencia!==false,
  ordenFlyer:parseInt(r.orden_flyer)||0,
  activo:r.activo!==false,
  createdBy:r.created_by||'',
  coincidenciaDudosa:r.coincidencia_dudosa===true,
  estadoRevision:r.estado_revision||'',
  revisionMotivo:r.revision_motivo||''
};}
function ofertaVigente(o,fecha){
  fecha=fecha||((new Date()).toISOString().slice(0,10));
  if(o.activo===false)return false;
  if(o.fechaDesde&&o.fechaDesde>fecha)return false;
  if(o.fechaHasta&&o.fechaHasta<fecha)return false;
  return true;
}

function ofertaActivaParaArticulo(ofertas,art,fecha){
  if(!art)return null;
  fecha=fecha||((new Date()).toISOString().slice(0,10));
  var aid=String(art.id||''),cod=String(art.cod||''),codArt=String(art.codArt||'');
  var vig=(ofertas||[]).filter(function(o){
    return ofertaVigente(o,fecha)&&(
      (o.articuloId&&String(o.articuloId)===aid)||
      (o.cod&&String(o.cod)===cod)||
      (o.codArt&&codArt&&String(o.codArt)===codArt)
    );
  });
  vig.sort(function(a,b){return (parseFloat(a.precioOferta)||999999999)-(parseFloat(b.precioOferta)||999999999);});
  return vig[0]||null;
}
function precioPedidoConOferta(art,ofertas){
  var o=ofertaActivaParaArticulo(ofertas,art);
  return {oferta:o,precio:o?parseFloat(o.precioOferta)||artPrecioPublicoUnit(art):artPrecioPublicoUnit(art)};
}
function fileToCompressedDataUrl(file,maxSize,quality){
  maxSize=maxSize||900; quality=quality||0.78;
  return new Promise(function(resolve,reject){
    if(!file){resolve('');return;}
    if(!/^image\//.test(file.type||'')){reject(new Error('El archivo debe ser una imagen.'));return;}
    var reader=new FileReader();
    reader.onload=function(){
      var img=new Image();
      img.onload=function(){
        var w=img.width,h=img.height;
        var scale=Math.min(1,maxSize/Math.max(w,h));
        var canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(w*scale));
        canvas.height=Math.max(1,Math.round(h*scale));
        var ctx=canvas.getContext('2d');
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror=function(){reject(new Error('No se pudo leer la imagen.'));};
      img.src=reader.result;
    };
    reader.onerror=function(){reject(new Error('No se pudo leer el archivo.'));};
    reader.readAsDataURL(file);
  });
}
function descargarDataUrl(dataUrl,nombre){
  var a=document.createElement('a');a.href=dataUrl;a.download=nombre||'imagen.png';document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);},50);
}

function pctCumplido(actual,obj){obj=parseFloat(obj)||0;actual=parseFloat(actual)||0;return obj>0?Math.min(100,Math.round((actual/obj)*100)):0;}

/* ═══════════════════════════
   V53 — Ofertas Relámpago Fix
   Reincorpora el componente OfertasPreventistas que faltaba en la combinación V52.
   Si algo falla en Supabase, la pantalla no queda en blanco: muestra aviso y permite reintentar.
═══════════════════════════ */
/* V54 — restaura vista anterior de Ofertas Relámpago: tarjetas + flyer A4 siempre visible */
function OfertasPreventistas(props){
  var user=props.user;
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isPrev=user.role==='preventista';
  var _of=useState([]),ofertas=_of[0],setOfertas=_of[1];
  var _arts=useState([]),arts=_arts[0],setArts=_arts[1];
  var _q=useState(''),q=_q[0],setQ=_q[1];
  var _sel=useState(null),sel=_sel[0],setSel=_sel[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];
  var _ids=useState([]),selectedIds=_ids[0],setSelectedIds=_ids[1];
  var _mode=useState('catalogo'),flyerMode=_mode[0],setFlyerMode=_mode[1];
  var flyerRef=useRef(null);
  var hoy=(new Date()).toISOString().slice(0,10);
  var _f=useState({precioOferta:'',precioAnterior:'',mostrarPrecioAnterior:true,fechaDesde:hoy,fechaHasta:'',mostrarVigencia:true,stockInfo:'',observacion:'',fotoUrl:'',mostrarFlyer:true,ordenFlyer:0}),form=_f[0],setForm=_f[1];

  if(!(isAdminOrCo||isPrev))return E('div',{className:'empty'},'Módulo no disponible para tu rol.');

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4500);}
  function set(k,v){setForm(Object.assign({},form,{[k]:v}));}
  function cargar(){
    dbGet('ofertas_preventistas').then(function(rows){
      setOfertas((Array.isArray(rows)?rows:[]).map(dbToOferta));
    }).catch(function(e){flash('err','No se pudieron cargar ofertas relámpago. Ejecutá el SQL V29 de ofertas/flyer si todavía no lo hiciste.');});
    if(isAdminOrCo){
      dbGet('articulos').then(function(rows){
        setArts((Array.isArray(rows)?rows:[]).map(dbToArt).filter(function(a){return a.estado!=='inactivo';}));
      }).catch(function(){});
    }
  }
  useEffect(function(){cargar();},[]);

  var buscados=arts.map(function(a){return {a:a,s:artScore(a,q)};})
    .filter(function(x){return !q||!q.trim()||x.s>0;})
    .sort(function(x,y){return (y.s-x.s)||String(x.a.desc||'').localeCompare(String(y.a.desc||''),'es');})
    .slice(0,12).map(function(x){return x.a;});

  function elegirArticulo(a){
    setSel(a);
    setForm(Object.assign({},form,{precioOferta:a.precio||0,precioAnterior:a.precio||0}));
  }
  function onFoto(e){
    var file=e.target.files&&e.target.files[0];
    if(!file)return;
    fileToCompressedDataUrl(file,900,0.78).then(function(data){set('fotoUrl',data);})
      .catch(function(err){flash('err',err.message||'No se pudo cargar la foto.');});
  }
  function guardar(){
    if(!isAdminOrCo){flash('err','Solo Admin o Co-Admin puede crear ofertas relámpago.');return;}
    if(!sel){flash('err','Elegí un artículo del catálogo.');return;}
    if(!form.precioOferta||parseFloat(form.precioOferta)<=0){flash('err','Cargá un precio de oferta relámpago válido.');return;}
    if((parseFloat(form.precioOferta)||0)<(parseFloat(sel.costo)||0)){flash('err','El precio de oferta no puede quedar por debajo del precio de costo.');return;}
    if(!form.fechaDesde){flash('err','Completá la fecha desde.');return;}
    if(form.fechaHasta&&form.fechaHasta<form.fechaDesde){flash('err','La fecha hasta no puede ser menor que desde.');return;}
    var row=ofertaToDb({
      id:'of_'+sel.id,
      articuloId:sel.id,
      cod:sel.cod,
      codArt:sel.codArt,
      descripcion:sel.desc,
      precioRegular:(form.mostrarPrecioAnterior?parseFloat(form.precioAnterior||sel.precio||0):(sel.precio||0)),
      precioOferta:form.precioOferta,
      costo:sel.costo||0,
      fechaDesde:form.fechaDesde,
      fechaHasta:form.fechaHasta||null,
      stockInfo:form.stockInfo,
      observacion:form.observacion,
      fotoUrl:form.fotoUrl||'',
      mostrarFlyer:form.mostrarFlyer!==false,
      mostrarPrecioAnterior:form.mostrarPrecioAnterior!==false,
      mostrarVigencia:form.mostrarVigencia!==false,
      ordenFlyer:form.ordenFlyer||0,
      activo:true,
      createdBy:user.id
    });
    dbUpsert('ofertas_preventistas',row).then(function(){
      flash('ok','Oferta relámpago guardada. El precio se aplicará automáticamente al cargar el pedido.');
      setSel(null);setQ('');
      setForm({precioOferta:'',precioAnterior:'',mostrarPrecioAnterior:true,fechaDesde:hoy,fechaHasta:'',mostrarVigencia:true,stockInfo:'',observacion:'',fotoUrl:'',mostrarFlyer:true,ordenFlyer:0});
      cargar();
    }).catch(function(e){flash('err','No se pudo guardar: '+e.message);});
  }
  function cambiarEstado(o,activo){
    dbUpdate('ofertas_preventistas',o.id,{activo:activo}).then(function(){flash('ok',activo?'Oferta relámpago reactivada.':'Oferta relámpago desactivada.');cargar();})
      .catch(function(){flash('err','No se pudo actualizar la oferta relámpago.');});
  }
  function borrar(o){
    if(!confirm('¿Eliminar definitivamente la oferta relámpago de '+o.descripcion+'?'))return;
    dbDelete('ofertas_preventistas',o.id).then(function(){flash('ok','Oferta relámpago eliminada.');cargar();})
      .catch(function(){flash('err','No se pudo eliminar.');});
  }
  function toggleSelect(id){
    setSelectedIds(selectedIds.indexOf(id)>=0?selectedIds.filter(function(x){return x!==id;}):selectedIds.concat([id]));
  }

  var visibles=isAdminOrCo?ofertas:ofertas.filter(function(o){return ofertaVigente(o,hoy);});
  visibles=visibles.slice().sort(function(a,b){
    var av=ofertaVigente(a,hoy)?0:1,bv=ofertaVigente(b,hoy)?0:1;
    return (av-bv)||((a.ordenFlyer||0)-(b.ordenFlyer||0))||String(a.descripcion||'').localeCompare(String(b.descripcion||''),'es');
  });
  var vigentes=visibles.filter(function(o){return ofertaVigente(o,hoy)&&o.mostrarFlyer!==false;});
  var flyerOfertas=vigentes;
  if(flyerMode==='seleccion')flyerOfertas=vigentes.filter(function(o){return selectedIds.indexOf(o.id)>=0;});
  if(flyerMode==='destacado')flyerOfertas=vigentes.filter(function(o){return selectedIds.indexOf(o.id)>=0;}).slice(0,1);
  if(flyerMode==='destacado'&&flyerOfertas.length===0&&vigentes[0])flyerOfertas=[vigentes[0]];

  function chunks(arr,n){var out=[];for(var i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out;}
  function printFlyer(){
    document.body.classList.add('print-flyer-mode');
    setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove('print-flyer-mode');},400);},80);
  }
  function exportFlyerImg(){
    if(!window.html2canvas){flash('err','No se pudo cargar html2canvas para exportar imagen.');return;}
    if(!flyerRef.current){flash('err','No hay flyer para exportar.');return;}
    var pages=Array.prototype.slice.call(flyerRef.current.querySelectorAll('.flyer-a4'));
    if(!pages.length){flash('err','No hay páginas A4 para exportar.');return;}
    var host=document.createElement('div');
    host.className='flyer-export-host';
    document.body.appendChild(host);
    var clones=pages.map(function(page){
      var clone=page.cloneNode(true);
      host.appendChild(clone);
      return clone;
    });
    flash('ok','Generando imagen'+(pages.length>1?'es por hoja A4…':'…'));
    function cleanup(){if(host&&host.parentNode)host.parentNode.removeChild(host);}
    function renderPage(i){
      var page=clones[i];
      return window.html2canvas(page,{scale:3,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:794,windowHeight:1123,width:794,height:page.scrollHeight,scrollX:0,scrollY:0}).then(function(canvas){
        var n=String(i+1).padStart(2,'0');
        var fname=pages.length>1?'Oferta_Relampago_ALISTA_AHORRO_Hoja_'+n+'.png':'Oferta_Relampago_ALISTA_AHORRO.png';
        descargarDataUrl(canvas.toDataURL('image/png'),fname);
        return new Promise(function(resolve){setTimeout(resolve,350);});
      });
    }
    var p=Promise.resolve();
    pages.forEach(function(_,i){p=p.then(function(){return renderPage(i);});});
    p.then(function(){cleanup();flash('ok',pages.length>1?'Imágenes generadas por hoja A4.':'Imagen generada.');})
      .catch(function(e){cleanup();flash('err','No se pudo generar imagen: '+e.message);});
  }

  function ofertaCard(o){
    var vig=ofertaVigente(o,hoy);
    return E('div',{key:o.id,className:'offer-card '+(vig?'':'off')},
      isAdminOrCo&&E('label',{className:'offer-select'},
        E('input',{type:'checkbox',checked:selectedIds.indexOf(o.id)>=0,onChange:function(){toggleSelect(o.id);}}),' Usar en flyer seleccionado'
      ),
      o.fotoUrl&&E('img',{className:'offer-thumb',src:o.fotoUrl,alt:o.descripcion||'Oferta'}),
      E('div',{className:'offer-top'},
        E('div',null,
          E('div',{className:'offer-title'},o.descripcion||'Artículo sin descripción'),
          E('div',{className:'offer-code'},'Código: '+(o.cod||'—')+(o.codArt?' · '+o.codArt:''))
        ),
        E('span',{className:'pill '+(vig?'ok':'bad')},vig?'vigente':'no vigente')
      ),
      E('div',{className:'offer-prices'},
        o.mostrarPrecioAnterior!==false&&E('div',null,E('small',null,'Precio anterior'),E('del',null,'$'+$(o.precioRegular))),
        E('div',null,E('small',null,'Oferta Relámpago'),E('strong',null,'$'+$(o.precioOferta)))
      ),
      E('div',{className:'offer-meta'},
        o.mostrarVigencia!==false&&E('span',null,'Desde: '+(o.fechaDesde||'—')),
        o.mostrarVigencia!==false&&E('span',null,'Hasta: '+(o.fechaHasta||'sin fecha'))
      ),
      o.stockInfo&&E('div',{className:'offer-note'},'Stock / condición: '+o.stockInfo),
      o.observacion&&E('div',{className:'offer-note'},'Obs.: '+o.observacion),
      isAdminOrCo&&E('div',{className:'brow',style:{marginTop:10}},
        E('button',{className:'btn sm '+(o.activo===false?'ok':'warn'),onClick:function(){cambiarEstado(o,o.activo===false);}},o.activo===false?'Reactivar':'Desactivar'),
        E('button',{className:'btn sm dan',onClick:function(){borrar(o);}},'Eliminar')
      )
    );
  }
  function flyerItem(o,big){
    return E('div',{className:big?'flyer-product featured':'flyer-product'},
      E('div',{className:'flyer-img-wrap'},o.fotoUrl?E('img',{src:o.fotoUrl,alt:o.descripcion||'Oferta'}):E('div',{className:'flyer-no-img'},'SIN FOTO')),
      E('div',{className:'flyer-prod-name'},o.descripcion||'Producto'),
      E('div',{className:'flyer-code'},'Código: '+(o.cod||'—')),
      o.mostrarPrecioAnterior!==false&&o.precioRegular>0&&E('div',{className:'flyer-prev'},'Antes $'+$(o.precioRegular)),
      E('div',{className:'flyer-price'},'$'+$(o.precioOferta)),
      o.mostrarVigencia!==false&&E('div',{className:'flyer-valid'},o.fechaHasta?'Válido hasta '+o.fechaHasta:'Oferta vigente')
    );
  }
  function flyerHeader(){return E('div',{className:'flyer-header'},
    E('img',{src:'assets/img/logo-alista-ahorro.png',alt:'ALISTA AHORRO'}),
    E('div',{className:'flyer-title-wrap'},
      E('div',{className:'flyer-title'},'OFERTA RELÁMPAGO'),
      E('div',{className:'flyer-sub'},'Precios especiales por tiempo limitado')
    )
  );}
  function flyerFooter(){return E('div',{className:'flyer-footer'},
    E('span',null,'WhatsApp: '+BIZ.wa),
    E('span',null,'Instagram: '+BIZ.instagram),
    E('span',null,BIZ.dir)
  );}
  function flyerPreview(){
    if(!flyerOfertas.length)return E('div',{className:'empty'},'No hay ofertas relámpago vigentes para armar el flyer.');
    if(flyerMode==='destacado')return E('div',{className:'flyer-a4 flyer-single'},flyerHeader(),E('div',{className:'flyer-single-body'},flyerItem(flyerOfertas[0],true)),flyerFooter());
    return E('div',null,chunks(flyerOfertas,8).map(function(page,idx){return E('div',{key:idx,className:'flyer-a4'},
      flyerHeader(),
      E('div',{className:'flyer-grid-8'},page.map(function(o){return flyerItem(o,false);})),
      flyerFooter()
    );}));
  }

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    isAdminOrCo&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🔥 Crear oferta relámpago para preventistas'),
        E('button',{className:'btn',onClick:cargar},'🔄 Actualizar')
      ),
      E('div',{className:'alert warn'},E('span',null,'El precio de oferta se aplica automáticamente cuando el preventista carga el producto en un pedido.')),
      E('div',{className:'fg'},E('label',null,'Buscar artículo'),
        E('input',{className:'fi',value:q,onChange:function(e){setQ(e.target.value);},placeholder:'Código o descripción…'})
      ),
      q&&E('div',{className:'offer-search-list'},buscados.length?buscados.map(function(a){return E('button',{key:a.id,className:'offer-search-item '+(sel&&sel.id===a.id?'on':''),onClick:function(){elegirArticulo(a);}},
        E('span',null,a.desc),E('small',null,(a.cod||'')+' · Público $'+$(a.precio)+' · Costo $'+$(a.costo))
      );}):E('div',{className:'empty',style:{padding:10}},'No hay coincidencias.')),
      sel&&E('div',{className:'alert ok'},E('span',null,'Seleccionado: '+sel.desc+' · Código '+(sel.cod||'—')+' · Precio actual $'+$(sel.precio))),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Precio oferta relámpago $'),E('input',{className:'fi',type:'number',min:0,value:form.precioOferta,onChange:function(e){set('precioOferta',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Precio anterior opcional $'),E('input',{className:'fi',type:'number',min:0,value:form.precioAnterior,onChange:function(e){set('precioAnterior',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Desde'),E('input',{className:'fi',type:'date',value:form.fechaDesde,onChange:function(e){set('fechaDesde',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Hasta opcional'),E('input',{className:'fi',type:'date',value:form.fechaHasta,onChange:function(e){set('fechaHasta',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Stock / condición opcional'),E('input',{className:'fi',value:form.stockInfo,onChange:function(e){set('stockInfo',e.target.value);},placeholder:'Ej: hasta agotar stock, mínimo 2 bultos…'})),
        E('div',{className:'fg'},E('label',null,'Orden en flyer'),E('input',{className:'fi',type:'number',value:form.ordenFlyer,onChange:function(e){set('ordenFlyer',e.target.value);}}))
      ),
      E('div',{className:'grid2'},
        E('label',{className:'checkline'},E('input',{type:'checkbox',checked:form.mostrarPrecioAnterior!==false,onChange:function(e){set('mostrarPrecioAnterior',e.target.checked);}}),' Mostrar precio anterior'),
        E('label',{className:'checkline'},E('input',{type:'checkbox',checked:form.mostrarVigencia!==false,onChange:function(e){set('mostrarVigencia',e.target.checked);}}),' Mostrar vigencia'),
        E('label',{className:'checkline'},E('input',{type:'checkbox',checked:form.mostrarFlyer!==false,onChange:function(e){set('mostrarFlyer',e.target.checked);}}),' Incluir en flyer')
      ),
      E('div',{className:'fg'},E('label',null,'Foto de la oferta opcional'),E('input',{className:'fi',type:'file',accept:'image/*',onChange:onFoto}),form.fotoUrl&&E('div',{className:'photo-preview'},E('img',{src:form.fotoUrl,alt:'Foto oferta'}),E('button',{className:'btn sm',onClick:function(){set('fotoUrl','');}},'Quitar foto'))),
      E('div',{className:'fg'},E('label',null,'Observación opcional'),E('textarea',{className:'fi',rows:2,value:form.observacion,onChange:function(e){set('observacion',e.target.value);},placeholder:'Ej: ideal para ofrecer a clientes con alta rotación…'})),
      E('button',{className:'btn pri',onClick:guardar},'💾 Guardar oferta relámpago')
    ),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},isAdminOrCo?'📋 Ofertas relámpago cargadas':'🔥 Ofertas relámpago disponibles para vender'),
        E('button',{className:'btn',onClick:cargar},'🔄 Actualizar')
      ),
      !isAdminOrCo&&E('div',{className:'alert ok'},E('span',null,'Estas ofertas relámpago aplican automáticamente en el pedido si cargás el producto correspondiente.')),
      E('div',{className:'offer-grid'},visibles.length?visibles.map(ofertaCard):E('div',{className:'empty'},isAdminOrCo?'Todavía no hay ofertas relámpago cargadas.':'No hay ofertas relámpago vigentes por ahora.'))
    ),
    E('div',{className:'card flyer-builder'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🧾 Catálogo / Flyer de Oferta Relámpago'),
        E('div',{className:'brow'},E('button',{className:'btn',onClick:printFlyer},'🖨️ Imprimir'),E('button',{className:'btn ok',onClick:exportFlyerImg},'🖼️ Sacar imagen'))
      ),
      isAdminOrCo&&E('div',{className:'brow flyer-tools'},
        E('button',{className:'btn '+(flyerMode==='catalogo'?'pri':''),onClick:function(){setFlyerMode('catalogo');}},'8 por página'),
        E('button',{className:'btn '+(flyerMode==='seleccion'?'pri':''),onClick:function(){setFlyerMode('seleccion');}},'Solo elegidas'),
        E('button',{className:'btn '+(flyerMode==='destacado'?'pri':''),onClick:function(){setFlyerMode('destacado');}},'Destacar 1')
      ),
      E('div',{className:'alert warn'},E('span',null,'Para flyer seleccionado o destacado, marcá las ofertas con el tilde "Usar en flyer seleccionado".')),
      E('div',{className:'alert ok'},E('span',null,'En celular la vista previa se adapta para leerse mejor. Al exportar imagen o imprimir, siempre sale en formato A4.')),
      E('div',{className:'flyer-preview-wrap',ref:flyerRef},flyerPreview())
    )
  );
}


function ObjetivoBar(props){
  var obj=parseFloat(props.obj)||0,act=parseFloat(props.act)||0,pct=pctCumplido(act,obj);
  var done=obj>0&&act>=obj;
  return E('div',{style:{marginBottom:10}},
    E('div',{style:{display:'flex',justifyContent:'space-between',gap:8,fontSize:13,marginBottom:4}},
      E('strong',null,props.label),
      E('span',{style:{color:done?'var(--green)':'var(--txt2)',fontWeight:700}},props.valueText||(act+' / '+obj))
    ),
    E('div',{style:{height:10,background:'#eef2f7',borderRadius:999,overflow:'hidden',border:'1px solid var(--border)'}},
      E('div',{style:{height:'100%',width:pct+'%',background:done?'var(--green)':'var(--blue)',transition:'width .25s'}})
    ),
    E('div',{style:{fontSize:11,color:'var(--txt2)',marginTop:2}},pct+'% cumplido')
  );
}

// Permission helpers
function canClientes(user){
  if(user.role==='admin'||user.role==='coadmin')return 'full';
  var p=(user.permisos||{}).clientes;
  return p||'none'; // 'none'|'read'|'full'
}
function canSeeSaldoCC(user){
  if(user.role==='admin'||user.role==='coadmin')return true;
  return !!(user.permisos||{}).cc_ver_saldo;
}
function canPagoCC(user){
  if(user.role==='admin')return true;
  return !!(user.permisos||{}).cc_registrar_pago;
}

// CC movement helper
function registrarMovCC(clienteId,clienteNombre,tipo,monto,saldoAntes,opts){
  var mov={
    id:uid(),cliente_id:clienteId,cliente_nombre:clienteNombre,
    tipo:tipo,monto:monto,saldo_antes:saldoAntes,
    saldo_despues:tipo==='debito'?saldoAntes+monto:Math.max(0,saldoAntes-monto),
    fecha:nowStr(),
    usuario_id:opts.userId||'',usuario_nombre:opts.userName||'',
    pedido_id:opts.pedidoId||null,forma_pago:opts.formaPago||null,
    referencia:opts.referencia||null,observaciones:opts.observaciones||null
  };
  return dbUpsert('movimientos_cc',mov).then(function(){
    return dbUpdate('clientes',clienteId,{deuda:mov.saldo_despues});
  });
}

// Map pedido → DB row (store complex fields as jsonb)
function pedToDb(p){return {
  id:p.id,n_pedido:p.nPedido,fecha:p.fecha,estado:p.estado,
  preventista_id:p.preventistaId,preventista_nombre:p.preventistaNombre,
  preparador_id:p.preparadorId||null,preparador_nombre:p.preparadorNombre||null,
  cliente:p.cliente,items:p.items,items_finales:p.itemsFinales||null,
  sub:p.sub||0,desc_pct:p.descPct||0,desc_amt:p.descAmt||0,total:p.total||0,
  nota:p.nota||null,nota_prep:p.notaPrep||null,
  forma_pago:p.formaPago||null,monto_pago:p.montoPago||0,
  datos_pago:p.datosPago||null,nota_cliente:p.notaCliente||null,
  fecha_preparado:p.fechaPreparado||null,fecha_retiro:p.fechaRetiro||null,
  fecha_entregado:p.fechaEntregado||null,gps_creacion:p.gpsCreacion||null,
  rendicion:p.rendicion||null,devoluciones:p.devoluciones||[],
  cancelado_por:p.canceladoPor||null,cancelado_fecha:p.canceladoFecha||null,
  cancelado_motivo:p.canceladoMotivo||null,
  turno_id:p.turnoId||p.turno_id||null
};}
function dbToPed(r){return {
  id:r.id,nPedido:r.n_pedido,fecha:r.fecha,estado:r.estado,
  preventistaId:r.preventista_id,preventistaNombre:r.preventista_nombre,
  preparadorId:r.preparador_id,preparadorNombre:r.preparador_nombre,
  cliente:r.cliente,items:r.items,itemsFinales:r.items_finales,
  sub:parseFloat(r.sub)||0,descPct:parseFloat(r.desc_pct)||0,descAmt:parseFloat(r.desc_amt)||0,total:parseFloat(r.total)||0,
  nota:r.nota,notaPrep:r.nota_prep,formaPago:r.forma_pago,montoPago:parseFloat(r.monto_pago)||0,
  datosPago:r.datos_pago,notaCliente:r.nota_cliente,
  fechaPreparado:r.fecha_preparado,fechaRetiro:r.fecha_retiro,fechaEntregado:r.fecha_entregado,
  gpsCreacion:r.gps_creacion,rendicion:r.rendicion||null,devoluciones:r.devoluciones||[],
  canceladoPor:r.cancelado_por||null,canceladoFecha:r.cancelado_fecha||null,
  canceladoMotivo:r.cancelado_motivo||null,turnoId:r.turno_id||null
};}

/* ═══════════════════════════
   STORAGE (localStorage fallback)
═══════════════════════════ */
function gl(k,d){try{var v=localStorage.getItem(k);return v!==null?JSON.parse(v):d;}catch(e){return d;}}
function sl(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

function getAdmin(){return Object.assign({},ADMIN_DEF,{id:'root',role:'admin',activo:true});}

/* ═══════════════════════════
   BOOT — seed cloud DB once
═══════════════════════════ */
function boot(){
  // En V21 ya no se crean usuarios demo ni datos demo desde el navegador.
  // La app solo inicializa configuraciones locales no sensibles.
  if(!getAuthSession())return;
  if(!gl('nextPedido',null))sl('nextPedido',100);
  if(!gl('cfg',null))sl('cfg',{descGlobal:5,descXUser:{}});
  if(!gl('comisiones',null))sl('comisiones',{});
}

/* ═══════════════════════════
   HELPERS
═══════════════════════════ */
var uid=function(){return '_'+Math.random().toString(36).slice(2,9);};
var $=function(n){return (n||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});};
var $i=function(n){return (n||0).toLocaleString('es-AR',{maximumFractionDigits:0});};
function pad2(n){return String(n).padStart(2,'0');}
function formatDateTime24(d){
  d=d||new Date();
  return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds());
}
function formatDateOnly(d){
  d=d||new Date();
  return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'/'+d.getFullYear();
}
function fechaSolo(v){
  v=String(v||'').trim();
  if(!v)return '—';
  var m=v.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
  if(m)return m[1];
  if(v.indexOf(',')>=0)return v.split(',')[0].trim();
  return v;
}
function horaSolo(v){
  v=String(v||'').trim();
  if(!v)return '—';
  var m=v.match(/(\d{1,2}:\d{2}(?::\d{2})?)$/);
  if(m)return m[1];
  if(v.indexOf(',')>=0)return (v.split(',')[1]||v).trim();
  return v;
}
var nowStr=function(){return formatDateTime24(new Date());};
var todayStr=function(){return formatDateOnly(new Date());};

function normTxt(v){
  return String(v==null?'':v)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}
function rowVal(row, aliases){
  var keys=Object.keys(row||{});
  var aliasNorm=aliases.map(normTxt);
  for(var i=0;i<keys.length;i++){
    var nk=normTxt(keys[i]);
    if(aliasNorm.indexOf(nk)>=0)return row[keys[i]];
  }
  // segunda pasada: permite encabezados parecidos, por ejemplo "P. VENTA" vs "precio venta"
  for(var j=0;j<keys.length;j++){
    var nk2=normTxt(keys[j]);
    for(var k=0;k<aliasNorm.length;k++){
      if(nk2.indexOf(aliasNorm[k])>=0 || aliasNorm[k].indexOf(nk2)>=0)return row[keys[j]];
    }
  }
  return '';
}
function parseMoney(v){
  if(v==null||v==='')return 0;
  if(typeof v==='number')return isFinite(v)?v:0;
  var s=String(v).trim().replace(/\s/g,'').replace(/\$/g,'');
  if(!s)return 0;
  var hasComma=s.indexOf(',')>=0, hasDot=s.indexOf('.')>=0;
  if(hasComma&&hasDot){
    // Formato argentino: 6.800,00
    s=s.replace(/\./g,'').replace(',', '.');
  }else if(hasComma){
    s=s.replace(',', '.');
  }else if(hasDot){
    // Si tiene un solo punto y exactamente 3 dígitos al final, es miles: 6.800 => 6800
    var parts=s.split('.');
    if(parts.length===2 && /^\d{3}$/.test(parts[1]))s=parts[0]+parts[1];
  }
  var n=parseFloat(s.replace(/[^0-9.-]/g,''));
  return isFinite(n)?n:0;
}

// Encabezados aceptados para importar lista de precios.
// Soporta archivos con título arriba, por ejemplo: "Lista de Precios" en la fila 1
// y encabezados reales en la fila 2: CODIGO_PROPIO, DESCRIPCION, COSTO_CON_IVA, P_MAYORISTA.
var ART_ALIAS_COD=['CODIGO_PROPIO','CODIGO PROPIO','CODIGO','CÓDIGO','COD','COD ART','CODIGO ARTICULO','CÓDIGO ARTÍCULO','SKU','ID','BARRA','COD_BARRA','CODIGO_BARRA'];
var ART_ALIAS_CODART=['COD_ART','COD ART','CODIGO_ARTICULO','CODIGO ARTICULO','CÓDIGO ARTÍCULO','Cód.Artículo','Cod Articulo','CODIGO INTERNO','COD INTERNO'];
var ART_ALIAS_DESC=['DESCRIPCION','DESCRIPCIÓN','Descripcion','Descripción','NOMBRE','Nombre','PRODUCTO','ARTICULO','ARTÍCULO','DETALLE','DESCRIPCION ARTICULO','DESCRIPCIÓN ARTÍCULO'];
var ART_ALIAS_PRECIO=['P_MAYORISTA','P MAYORISTA','P.MAYORISTA','PMAYORISTA','PRECIO_MAYORISTA','PRECIO MAYORISTA','MAYORISTA','PUBLICO','PÚBLICO','PUBLICO.','P_PUBLICO','P PUBLICO','PVP','PRECIO_PUBLICO','PRECIO PÚBLICO','PRECIO PUBLICO','PRECIO AL PUBLICO','PRECIO AL PÚBLICO','Precio al Público','Precio al Publico','PRECIO_VENTA','PRECIO VENTA','Precio de Venta','Precio Venta','P. VENTA','P VENTA','PRECIO_BASE','PRECIO BASE','Precio Base','PRECIO','Precio','VENTA','LISTA','PRECIO LISTA','P_LISTA'];
var ART_ALIAS_PESABLE=['PESABLE','PESABLE?','CPESABLE','C PESABLE','ES_PESABLE','ES PESABLE','BALANZA','POR KG','POR_KG','KG','PESO','VENTA POR KG','SE VENDE POR KG','SE_VENDE_POR_KG','PESABLE SI NO','PESABLE_SI_NO'];
var ART_ALIAS_COSTO=['COSTO_CON_IVA','COSTO CON IVA','COSTO CON I.V.A.','COSTO_IVA','COSTO IVA','COSTO','Costo','PRECIO_COSTO','PRECIO COSTO','Precio de Costo','Precio Costo','COSTO FINAL','COSTO UNITARIO','P_COSTO'];

function esHeaderParecido(valor, aliases){
  var nv=normTxt(valor);
  if(!nv)return false;
  for(var i=0;i<aliases.length;i++){
    var na=normTxt(aliases[i]);
    if(nv===na)return true;
    if(nv.indexOf(na)>=0 || na.indexOf(nv)>=0)return true;
  }
  return false;
}

function detectarFilaEncabezado(aoa){
  var best=-1,bestScore=0;
  for(var r=0;r<Math.min(30,aoa.length);r++){
    var row=aoa[r]||[];
    var score=0,hasCod=false,hasDesc=false;
    for(var c=0;c<row.length;c++){
      var cell=row[c];
      if(esHeaderParecido(cell,ART_ALIAS_COD)){score+=3;hasCod=true;}
      if(esHeaderParecido(cell,ART_ALIAS_DESC)){score+=3;hasDesc=true;}
      if(esHeaderParecido(cell,ART_ALIAS_COSTO))score+=2;
      if(esHeaderParecido(cell,ART_ALIAS_PRECIO))score+=2;
    }
    // Exigimos código y descripción para no confundir el título "Lista de Precios" con encabezados.
    if(hasCod && hasDesc && score>bestScore){best=r;bestScore=score;}
  }
  return best;
}

function aoaToRowsConHeader(aoa,hoja){
  var hidx=detectarFilaEncabezado(aoa);
  if(hidx<0)return [];
  var headers=(aoa[hidx]||[]).map(function(h,i){
    var v=String(h==null?'':h).trim();
    return v || ('COLUMNA_'+(i+1));
  });
  var out=[];
  for(var r=hidx+1;r<aoa.length;r++){
    var line=aoa[r]||[];
    var tieneAlgo=line.some(function(v){return String(v==null?'':v).trim()!=='';});
    if(!tieneAlgo)continue;
    var obj={__hoja:hoja,__filaExcel:r+1,__headerExcel:hidx+1};
    headers.forEach(function(h,i){obj[h]=line[i];});
    out.push(obj);
  }
  return out;
}



function artHaystack(a){return normTxt([a&&a.cod,a&&a.codArt,a&&a.desc,a&&a.estado].join(' '));}
function artScore(a,query){
  var qn=normTxt(query);
  if(!qn)return 1;
  var words=qn.split(/\s+/).filter(Boolean);
  var hay=artHaystack(a);
  if(!hay)return 0;
  var score=0;
  for(var i=0;i<words.length;i++){
    var w=words[i];
    if(hay.indexOf(w)>=0){score+=20;continue;}
    // Búsqueda flexible: si el Excel abrevia COCA como COC, o similares, igual lo muestra.
    if(w.length>=4 && hay.indexOf(w.slice(0,3))>=0){score+=4;continue;}
    return 0;
  }
  var desc=normTxt(a&&a.desc), cod=normTxt(a&&a.cod), ca=normTxt(a&&a.codArt);
  if(desc.indexOf(qn)>=0)score+=50;
  if(desc.indexOf(qn)===0)score+=30;
  if(cod.indexOf(qn)>=0||ca.indexOf(qn)>=0)score+=40;
  return score;
}
function mergeByIdOrCode(listA,listB){
  var out=[],seen={};
  function add(a){
    if(!a)return;
    var k=String(a.id||a.cod||a.codArt||a.desc||Math.random());
    if(seen[k])return;
    seen[k]=true;out.push(a);
  }
  (listA||[]).forEach(add);(listB||[]).forEach(add);
  return out;
}
function extraerFilasExcel(wb){
  var all=[];
  (wb.SheetNames||[]).forEach(function(name){
    var sh=wb.Sheets[name];
    if(!sh)return;

    // Primero leemos como matriz para detectar encabezados aunque estén debajo de un título.
    var aoa=XLSX.utils.sheet_to_json(sh,{header:1,defval:'',raw:false,blankrows:false});
    var rows=aoaToRowsConHeader(aoa,name);

    // Fallback para archivos simples donde los encabezados ya están en la primera fila.
    if(!rows.length){
      rows=XLSX.utils.sheet_to_json(sh,{defval:'',raw:false});
      rows.forEach(function(r){r.__hoja=name;});
    }
    rows.forEach(function(r){all.push(r);});
  });
  return all;
}

function roleLabel(r){
  if(r==='admin')return 'Administrador';
  if(r==='coadmin')return 'Co-Administrador';
  if(r==='preventista')return 'Preventista';
  if(r==='preparador')return 'Preparador';
  return r;
}

function estadoLabel(s){
  var m={
    pendiente:'Pendiente de Preparación',
    preparado:'Preparado',
    listo_entrega:'Listo para Entrega',
    en_transito:'En Tránsito',
    entregado:'Entregado',
    finalizado:'Finalizado',
    cancelado:'Cancelado'
  };
  return m[s]||s;
}

function parseFecha(s){
  try{
    s=String(s||'').trim();
    var m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if(m)return new Date(+m[3],+m[2]-1,+m[1]);
    return new Date(s);
  }catch(e){return new Date(0);}
}
function inPeriod(v,period){
  var d=parseFecha(v.fecha);var now=new Date();
  if(period==='hoy')return d.toDateString()===now.toDateString();
  if(period==='semana'){var diff=(now-d)/864e5;return diff>=0&&diff<7;}
  if(period==='mes')return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
  if(period==='trim'){var dm=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth());return dm>=0&&dm<3;}
  if(period==='anio')return d.getFullYear()===now.getFullYear();
  return true;
}


function pedidoEsVendido(p){return p&&(p.estado==='listo_entrega'||p.estado==='en_transito'||p.estado==='entregado'||p.estado==='finalizado');}
function pedidoFechaComercial(p){return p&&((p.fechaEntregado||p.fechaPreparado||p.fecha)||'');}
function inPeriodPedido(p,period){return inPeriod({fecha:pedidoFechaComercial(p)},period);}
function isoToDate(v){if(!v)return null;var p=String(v).slice(0,10).split('-');if(p.length!==3)return null;return new Date(+p[0],+p[1]-1,+p[2]);}
function fechaARToIso(v){v=String(v||'').trim();var m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return m[3]+'-'+pad2(+m[2])+'-'+pad2(+m[1]);if(/^\d{4}-\d{2}-\d{2}/.test(v))return v.slice(0,10);return '';}
function fechaEnRangoISO(fecha,desde,hasta){var iso=fechaARToIso(fecha);if(!iso)return false;return (!desde||iso>=desde)&&(!hasta||iso<=hasta);}
function rangeLabel(desde,hasta){return desde===hasta?desde:(desde+' a '+hasta);}


/* ═══════════════════════════
   V47 — JORNADA / CAJA POR TURNO
═══════════════════════════ */
function parseARDateTime(v){
  if(!v)return new Date(0);
  v=String(v).trim();
  var m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if(m)return new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0),+(m[6]||0));
  var d=new Date(v);return isNaN(d.getTime())?new Date(0):d;
}
function fechaEntreTurno(fecha,ini,fin){
  var d=parseARDateTime(fecha),a=parseARDateTime(ini),b=fin?parseARDateTime(fin):new Date();
  return d>=a&&d<=b;
}
function turnoToDb(t){
  var o={
    id:t.id,usuario_id:t.usuarioId||t.usuario_id,usuario_nombre:t.usuarioNombre||t.usuario_nombre||'',
    fecha_inicio:t.fechaInicio||t.fecha_inicio,fecha_cierre:t.fechaCierre||t.fecha_cierre||null,
    estado:t.estado||'abierto',gps_inicio:t.gpsInicio||t.gps_inicio||null,gps_cierre:t.gpsCierre||t.gps_cierre||null,
    resumen:t.resumen||{},observaciones:t.observaciones||''
  };
  // No enviar created_at/updated_at en null: Supabase debe completar defaults.
  if(t.created_at)o.created_at=t.created_at;
  if(t.updated_at)o.updated_at=t.updated_at;
  return o;
}
function dbToTurno(r){return {
  id:r.id,usuarioId:r.usuario_id,usuarioNombre:r.usuario_nombre||'',fechaInicio:r.fecha_inicio,fechaCierre:r.fecha_cierre,
  estado:r.estado||'abierto',gpsInicio:r.gps_inicio||null,gpsCierre:r.gps_cierre||null,resumen:r.resumen||{},observaciones:r.observaciones||''
};}
function turnoActivoLocal(userId){return gl('turno_activo_'+userId,null);}
function setTurnoActivoLocal(userId,t){if(t)sl('turno_activo_'+userId,t);else localStorage.removeItem('turno_activo_'+userId);}
function getTurnoActivo(user){
  return dbGetSelect('turnos_jornada','*',{filter:'usuario_id=eq.'+encodeURIComponent(user.id)+'&estado=eq.abierto',order:'fecha_inicio.desc',limit:1})
    .then(function(rows){var t=rows&&rows[0]?dbToTurno(rows[0]):turnoActivoLocal(user.id);if(t&&t.estado==='abierto')setTurnoActivoLocal(user.id,t);return t;})
    .catch(function(){return turnoActivoLocal(user.id);});
}
function resumenTurnoDesdeDatos(turno,pedidos,movs){
  var ini=turno.fechaInicio,fin=turno.fechaCierre||nowStr();
  var peds=(pedidos||[]).filter(function(p){return p.preventistaId===turno.usuarioId&&fechaEntreTurno(p.fechaEntregado||p.fechaPreparado||p.fecha,ini,fin)&&['entregado','finalizado','listo_entrega','en_transito'].indexOf(p.estado)>=0;});
  var efectivo=0,transferencia=0,cc=0,total=0,cancelados=0;
  var trans=[],ccs=[],efes=[];
  peds.forEach(function(p){
    var r=p.rendicion||{};var cli=(p.cliente&&((p.cliente.nombreFantasia||'')||((p.cliente.nombre||'')+' '+(p.cliente.apellido||''))))||'Cliente';
    var e=parseFloat(r.efectivo)||0,tr=parseFloat(r.transferencia)||0,c=parseFloat(r.cuentaCorriente)||0,ta=parseFloat(r.totalARendir||p.total)||0;
    efectivo+=e;transferencia+=tr;cc+=c;total+=ta;
    if(e>0)efes.push({pedido:p.nPedido,cliente:cli,monto:e,fecha:p.fechaEntregado||p.fecha});
    if(tr>0)trans.push({pedido:p.nPedido,cliente:cli,monto:tr,datos:r.datosTrans||'',fecha:p.fechaEntregado||p.fecha});
    if(c>0)ccs.push({pedido:p.nPedido,cliente:cli,monto:c,fecha:p.fechaEntregado||p.fecha});
    if(p.estado==='cancelado')cancelados++;
  });
  var cobrosCC=(movs||[]).filter(function(m){return m.usuario_id===turno.usuarioId&&String(m.tipo||'')==='credito'&&fechaEntreTurno(m.fecha,ini,fin);});
  var cobrosEfectivo=0,cobrosTransferencia=0,cobrosOtros=0;
  var cobrosDetalle=cobrosCC.map(function(m){var f=String(m.forma_pago||'').toLowerCase();var monto=parseFloat(m.monto)||0;if(f.indexOf('transfer')>=0)cobrosTransferencia+=monto;else if(f.indexOf('efect')>=0)cobrosEfectivo+=monto;else cobrosOtros+=monto;return {cliente:m.cliente_nombre,monto:monto,forma:m.forma_pago||'',referencia:m.referencia||'',fecha:m.fecha};});
  return {
    desde:ini,hasta:fin,pedidos:peds.length,cancelados:cancelados,totalVendido:total,
    efectivo:efectivo,transferencia:transferencia,cuentaCorriente:cc,
    cobrosCC:cobrosCC.length,cobrosEfectivo:cobrosEfectivo,cobrosTransferencia:cobrosTransferencia,cobrosOtros:cobrosOtros,
    totalCaja:efectivo+transferencia+cobrosEfectivo+cobrosTransferencia+cobrosOtros,
    totalGeneral:efectivo+transferencia+cc+cobrosEfectivo+cobrosTransferencia+cobrosOtros,
    efectivoDetalle:efes,transferenciasDetalle:trans,ccDetalle:ccs,cobrosDetalle:cobrosDetalle
  };
}

function getMaxDesc(userId,userObj){
  var cfg=gl('cfg',{descGlobal:5,descXUser:{}});
  var hardMax=10; // regla comercial: nadie puede superar el 10%
  var p=(userObj&&userObj.permisos)||{};
  if(p.desc_deshabilitado)return 0;
  if(p.max_desc!==undefined&&p.max_desc!==null&&p.max_desc!=='')return Math.min(hardMax,Math.max(0,parseFloat(p.max_desc)||0));
  var u=(cfg.descXUser||{})[userId];
  if(u&&u.deshabilitado)return 0;
  if(u&&typeof u.max==='number')return Math.min(hardMax,Math.max(0,u.max));
  if(userObj&&(userObj.role==='admin'||userObj.role==='coadmin'))return hardMax;
  return Math.min(hardMax,Math.max(0,cfg.descGlobal!==undefined?parseFloat(cfg.descGlobal)||0:5));
}
function itemQtyFinal(it){return it.cantFinal!==undefined?parseFloat(it.cantFinal)||0:parseFloat(it.cant)||0;}
function itemEsPesable(it){return !!(it&&it.pesable);}
function itemPermiteKg(it){return !!(it&&(it.canPesable||it.pesableCatalogo||it.permiteKg));}
function qtyStep(it){return itemEsPesable(it)?'0.001':'1';}
function qtyLabel(it){return itemEsPesable(it)?'kg':'un.';}
function normalizarCantidad(v,pesable,min){var n=parseFloat(String(v).replace(',','.'));if(!isFinite(n))n=(min||0);n=Math.max(min||0,n);return pesable?Math.round(n*1000)/1000:Math.round(n);}
function itemCostoUnit(it){return Math.max(0,parseFloat(it&&it.costo)||0);}
function itemPrecioUnit(it){return Math.max(0,parseFloat(it&&it.pu)||0);}
function artPrecioPublicoUnit(a){
  var p=Math.max(0,parseFloat(a&&a.precio)||0);
  var c=Math.max(0,parseFloat(a&&a.costo)||0);
  // Si alguna carga quedó invertida, usamos el valor mayor como precio público.
  if(p>0&&c>0)return Math.max(p,c);
  return p||c||0;
}
function artCostoUnitFromArt(a){
  var p=Math.max(0,parseFloat(a&&a.precio)||0);
  var c=Math.max(0,parseFloat(a&&a.costo)||0);
  // Si alguna carga quedó invertida, usamos el valor menor como costo.
  if(p>0&&c>0)return Math.min(p,c);
  return c||0;
}
function findCatalogArtForItem(catalogo,it){
  if(!catalogo||!catalogo.length||!it)return null;
  var id=String(it.artId||it.id||'');
  var cod=normTxt(it.cod||'');
  var codArt=normTxt(it.codArt||'');
  for(var i=0;i<catalogo.length;i++){
    var a=catalogo[i];
    if(id && String(a.id||'')===id)return a;
    if(cod && normTxt(a.cod||'')===cod)return a;
    if(codArt && normTxt(a.codArt||'')===codArt)return a;
  }
  return null;
}
function normalizePedidoItemPrecio(it,catalogo){
  var x=Object.assign({},it||{});
  var art=findCatalogArtForItem(catalogo||[],x);
  var precioPublico=art?artPrecioPublicoUnit(art):Math.max(0,parseFloat(x.precioPublico)||0);
  var costoCatalogo=art?artCostoUnitFromArt(art):0;
  var costoActual=Math.max(0,parseFloat(x.costo)||0);
  if(costoCatalogo>0)x.costo=costoCatalogo;
  else x.costo=costoActual;

  var puActual=Math.max(0,parseFloat(x.pu)||0);
  var costoFinal=Math.max(0,parseFloat(x.costo)||0);

  // Corrección clave: si el pedido quedó guardado usando el costo como P.Unit,
  // recuperamos el precio público desde el catálogo antes de preparar/descontar.
  if(precioPublico>0 && (!puActual || (costoFinal>0 && puActual<=costoFinal+0.01 && precioPublico>puActual+0.01))){
    x.pu=precioPublico;
  }else{
    x.pu=puActual;
  }
  if(precioPublico>0)x.precioPublico=precioPublico;
  // V52: la venta por kg solo queda habilitada si el artículo del catálogo
  // está marcado como pesable. Si no es pesable, se fuerza venta por unidad.
  if(art){
    var teniaPesable=x.pesable;
    x.canPesable=!!art.pesable;
    x.pesable=!!art.pesable && (teniaPesable===undefined?true:!!teniaPesable);
  }else{
    x.canPesable=!!(x.canPesable||x.pesableCatalogo||x.permiteKg||x.pesable);
  }
  return x;
}
function maxLineDescByCost(it,maxDesc){
  maxDesc=Math.min(10,Math.max(0,parseFloat(maxDesc)||0));
  var pu=itemPrecioUnit(it), costo=itemCostoUnit(it);
  if(!pu||!costo)return maxDesc;
  if(pu<=costo)return 0;
  return Math.max(0,Math.min(maxDesc,(1-(costo/pu))*100));
}
function totalCostoItems(items){return (items||[]).reduce(function(s,it){return s+itemQtyFinal(it)*itemCostoUnit(it);},0);}
function subtotalItemsConDesc(items){return (items||[]).reduce(function(s,it){
  var d=Math.min(100,Math.max(0,parseFloat(it.descPct)||0));
  return s+itemQtyFinal(it)*itemPrecioUnit(it)*(1-d/100);
},0);}
function maxGeneralDescByCost(subtotal,costoTotal,maxDesc){
  maxDesc=Math.min(10,Math.max(0,parseFloat(maxDesc)||0));
  subtotal=Math.max(0,parseFloat(subtotal)||0);costoTotal=Math.max(0,parseFloat(costoTotal)||0);
  if(!subtotal||!costoTotal)return maxDesc;
  if(subtotal<=costoTotal)return 0;
  return Math.max(0,Math.min(maxDesc,(1-(costoTotal/subtotal))*100));
}

function recalcularPedidoPorItemsFinales(ped,itemsFinales,descGeneral){
  var clean=(itemsFinales||[]).map(function(it){return Object.assign({},it,{cantFinal:itemQtyFinal(it)});});
  var sub=subtotalItemsConDesc(clean);
  var costo=totalCostoItems(clean);
  var desc=Math.max(0,Math.min(100,parseFloat(descGeneral)||0));
  var descAmt=sub*(desc/100);
  var total=Math.max(0,sub-descAmt);
  return Object.assign({},ped,{itemsFinales:clean,sub:sub,descPct:desc,descAmt:descAmt,total:total,costoTotalPreparado:costo});
}
function totalOriginalPedido(ped){
  return subtotalItemsConDesc((ped&&ped.items)||[])*(1-((parseFloat(ped&&ped.descPct)||0)/100));
}
function clampPct(v,max){return Math.min(Math.max(0,parseFloat(max)||0),Math.max(0,parseFloat(v)||0));}

function exportXLSX(sheets,filename){
  var wb=XLSX.utils.book_new();
  sheets.forEach(function(s){
    var ws=XLSX.utils.json_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb,ws,s.name);
  });
  XLSX.writeFile(wb,filename);
}


function toInputDateLocal(d){
  d=d||new Date();
  var y=d.getFullYear();
  var m=String(d.getMonth()+1).padStart(2,'0');
  var day=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function dateInputToDate(v,endOfDay){
  if(!v)return null;
  var p=String(v).split('-');
  if(p.length!==3)return null;
  var d=new Date(+p[0],(+p[1])-1,+p[2],endOfDay?23:0,endOfDay?59:0,endOfDay?59:0,endOfDay?999:0);
  return isNaN(d.getTime())?null:d;
}
function pedidoFechaParaStock(p){return parseFecha(p.fechaEntregado||p.fechaPreparado||p.fecha||'');}
function pedidoEnRangoStock(p,desde,hasta){
  var d=pedidoFechaParaStock(p);
  if(!d||isNaN(d.getTime()))return false;
  var di=dateInputToDate(desde,false),hf=dateInputToDate(hasta,true);
  if(di&&d<di)return false;
  if(hf&&d>hf)return false;
  return true;
}
function pedidoVendidoParaStock(p){return p&&['listo_entrega','en_transito','entregado','finalizado'].indexOf(p.estado)>=0;}
function keyItemStock(it){return String(it.artId||it.cod||it.codArt||it.desc||'').trim();}
function cantidadDevueltaItem(p,it){
  var devs=p.devoluciones||[];
  var k=keyItemStock(it);
  var total=0;
  devs.forEach(function(d){
    var kd=keyItemStock(d);
    var mismo=(k&&kd&&k===kd)||((d.cod&&it.cod&&String(d.cod)===String(it.cod)))||(normTxt(d.desc||'')&&normTxt(d.desc||'')===normTxt(it.desc||''));
    if(mismo)total+=parseFloat(d.cantDev||d.cantidad||0)||0;
  });
  return total;
}
function generarResumenUnidadesVendidas(pedidos,desde,hasta,preventistaId){
  var agg={};
  var detalle=[];
  var ps=(pedidos||[]).filter(function(p){
    return pedidoVendidoParaStock(p)&&pedidoEnRangoStock(p,desde,hasta)&&(!preventistaId||p.preventistaId===preventistaId);
  });
  ps.forEach(function(p){
    (p.itemsFinales||p.items||[]).forEach(function(it){
      var enviada=parseFloat(it.cantFinal!==undefined?it.cantFinal:it.cant)||0;
      var dev=cantidadDevueltaItem(p,it);
      var vendida=Math.max(0,enviada-dev);
      if(vendida<=0)return;
      var k=keyItemStock(it)||normTxt(it.desc||'sin_codigo');
      if(!agg[k])agg[k]={
        codigo:it.cod||'',codigoArticulo:it.codArt||'',articuloId:it.artId||'',descripcion:it.desc||'',
        unidades:0,pedidos:{},monto:0,tipo:itemEsPesable(it)?'KG':'UNIDAD'
      };
      agg[k].unidades+=vendida;
      agg[k].pedidos[p.nPedido]=true;
      agg[k].monto+=vendida*(parseFloat(it.pu)||0)*(1-((parseFloat(it.descPct)||0)/100));
      detalle.push({
        'N° Pedido':p.nPedido,
        'Fecha entrega':p.fechaEntregado||p.fechaPreparado||p.fecha||'',
        'Preventista':p.preventistaNombre||'',
        'Cliente':((p.cliente&&((p.cliente.nombre||'')+' '+(p.cliente.apellido||'')))||'').trim(),
        'Código propio':it.cod||'',
        'Código artículo':it.codArt||'',
        'Artículo':it.desc||'',
        'Tipo':itemEsPesable(it)?'KG':'UNIDAD',
        'Unidades enviadas':enviada,
        'Unidades devueltas':dev,
        'Unidades vendidas':vendida,
        'Precio unitario':parseFloat(it.pu)||0,
        'Subtotal vendido':vendida*(parseFloat(it.pu)||0)*(1-((parseFloat(it.descPct)||0)/100))
      });
    });
  });
  var resumen=Object.keys(agg).map(function(k){var a=agg[k];return {
    'Código propio':a.codigo,
    'Código artículo':a.codigoArticulo,
    'Artículo':a.descripcion,
    'Tipo':a.tipo||'UNIDAD',
    'Unidades vendidas':a.unidades,
    'Pedidos':Object.keys(a.pedidos).length,
    'Monto vendido':a.monto
  };}).sort(function(a,b){return String(a['Artículo']).localeCompare(String(b['Artículo']),'es');});
  var zona=resumen.map(function(r){return {
    'CODIGO_PROPIO':r['Código propio'],
    'DESCRIPCION':r['Artículo'],
    'TIPO':r['Tipo']||'UNIDAD',
    'UNIDADES_VENDIDAS':r['Unidades vendidas']
  };});
  return {resumen:resumen,detalle:detalle,zona:zona,pedidos:ps.length};
}

/* ═══════════════════════════
   GPS HELPERS
═══════════════════════════ */
function gpsKey(userId){return 'gps_'+userId+'_'+todayStr().replace(/\//g,'-');}
var __gpsSyncLast={};
function saveGPSPoint(userId,lat,lng,user){
  var ts=Date.now();
  var k=gpsKey(userId);
  var pts=gl(k,[]);
  pts.push({lat:lat,lng:lng,ts:ts});
  // keep max 500 points
  if(pts.length>500)pts=pts.slice(-500);
  sl(k,pts);
  // V35: también sincroniza puntos GPS a Supabase para que el administrador pueda verlos desde otro equipo.
  if(typeof dbUpsert==='function'&&(!__gpsSyncLast[userId]||ts-__gpsSyncLast[userId]>8000)){
    __gpsSyncLast[userId]=ts;
    var d=new Date(ts);
    dbUpsert('gps_puntos',{
      id:String(userId)+'_'+String(ts),
      usuario_id:String(userId),
      usuario_nombre:(user&&(user.nombre||user.username))||'',
      fecha:nowStr(),
      fecha_dia:d.toISOString().slice(0,10),
      lat:lat,
      lng:lng,
      ts:ts,
      activo:true
    }).catch(function(e){console.warn('No se pudo sincronizar GPS remoto',e&&e.message?e.message:e);});
  }
}
function getGPSPoints(userId,dateStr){
  var k='gps_'+userId+'_'+(dateStr||todayStr().replace(/\//g,'-'));
  return gl(k,[]);
}
function getGPSStatus(userId){
  return gl('gps_active_'+userId,false);
}
function setGPSStatus(userId,val){
  sl('gps_active_'+userId,val);
}

function gpsMinutesNow(){
  var d=new Date();
  return d.getHours()*60+d.getMinutes();
}
function gpsJornadaInfo(){
  var m=gpsMinutesNow();
  var manIni=8*60, manFin=11*60+30, tarIni=17*60, tarFin=18*60+30;
  if(m<manIni)return {puedeIniciar:false,locked:false,msg:'El recorrido se habilita desde las 08:00.',unlock:'08:00'};
  if(m>=manIni&&m<manFin)return {puedeIniciar:true,locked:true,msg:'Recorrido de mañana activo. No se puede finalizar hasta las 11:30.',unlock:'11:30'};
  if(m>=tarIni&&m<tarFin)return {puedeIniciar:true,locked:true,msg:'Recorrido de tarde activo. No se puede finalizar hasta las 18:30.',unlock:'18:30'};
  return {puedeIniciar:true,locked:false,msg:'Podés iniciar o finalizar el recorrido.',unlock:null};
}
function gpsMapsText(lat,lng){
  if(lat==null||lng==null)return '';
  return String(lat)+','+String(lng);
}


/* ═══════════════════════════
   V43 — BALANCE DE RECORRIDO OFFLINE/ONLINE
   Registra eventos de trabajo aunque no haya internet. Cuando vuelve conexión,
   sincroniza automáticamente con Supabase.
═══════════════════════════ */
function auditPendingKey(){return 'aa_auditoria_pendiente_v43';}
function auditSyncedKey(){return 'aa_auditoria_sync_ok_v43';}
function auditGetPending(){return gl(auditPendingKey(),[]);}
function auditSetPending(arr){sl(auditPendingKey(),arr||[]);}
function auditAddLocal(ev){var a=auditGetPending();a.push(ev);auditSetPending(a.slice(-1000));}
function auditGetSynced(){return gl(auditSyncedKey(),[]);}
function auditAddSynced(ev){var a=auditGetSynced();a.push(ev);sl(auditSyncedKey(),a.slice(-500));}
function auditLastGps(userId){return gl('gps_last_'+userId,null);}
function auditBuildEvent(user,tipo,accion,opts){
  opts=opts||{};
  var gps=opts.gps||auditLastGps(user&&user.id);
  var ts=Date.now();
  var id=(opts.id||('ev_'+String((user&&user.id)||'u')+'_'+ts+'_'+Math.random().toString(36).slice(2,6)));
  return {
    id:id,
    usuario_id:String((user&&user.id)||opts.usuario_id||''),
    usuario_nombre:String((user&&(user.nombre||user.username))||opts.usuario_nombre||''),
    rol:String((user&&user.role)||opts.rol||''),
    fecha:nowStr(),
    fecha_dia:(new Date(ts)).toISOString().slice(0,10),
    hora:horaSolo(nowStr()),
    ts:ts,
    tipo:String(tipo||'evento'),
    accion:String(accion||''),
    cliente_id:opts.cliente_id||null,
    cliente_nombre:opts.cliente_nombre||null,
    pedido_id:opts.pedido_id||null,
    monto:opts.monto!=null?parseFloat(opts.monto)||0:null,
    resultado:opts.resultado||null,
    observaciones:opts.observaciones||null,
    lat:gps&&gps.lat!=null?parseFloat(gps.lat):null,
    lng:gps&&gps.lng!=null?parseFloat(gps.lng):null,
    accuracy:gps&&gps.acc!=null?parseFloat(gps.acc):null,
    gps_estado:gps?'ok':'sin_gps',
    sync_estado:'pendiente',
    sync_ts:null
  };
}
function auditEventToDb(ev){return {
  id:ev.id,usuario_id:ev.usuario_id,usuario_nombre:ev.usuario_nombre,rol:ev.rol,
  fecha:ev.fecha,fecha_dia:ev.fecha_dia,hora:ev.hora,ts:ev.ts,
  tipo:ev.tipo,accion:ev.accion,cliente_id:ev.cliente_id,cliente_nombre:ev.cliente_nombre,
  pedido_id:ev.pedido_id,monto:ev.monto,resultado:ev.resultado,observaciones:ev.observaciones,
  lat:ev.lat,lng:ev.lng,accuracy:ev.accuracy,gps_estado:ev.gps_estado,
  sync_estado:'sincronizado',sync_ts:(new Date()).toISOString()
};}
function auditRecord(user,tipo,accion,opts){
  var ev=auditBuildEvent(user,tipo,accion,opts||{});
  auditAddLocal(ev);
  auditSyncPending();
  return ev;
}
function auditSyncPending(){
  var pend=auditGetPending();
  if(!pend.length)return Promise.resolve({ok:true,count:0});
  if(!navigator.onLine)return Promise.resolve({ok:false,offline:true,count:pend.length});
  var left=[];
  var chain=Promise.resolve();
  pend.forEach(function(ev){
    chain=chain.then(function(){
      return dbUpsert('auditoria_eventos',auditEventToDb(ev)).then(function(){
        ev.sync_estado='sincronizado';ev.sync_ts=(new Date()).toISOString();auditAddSynced(ev);
      }).catch(function(){left.push(ev);});
    });
  });
  return chain.then(function(){auditSetPending(left);return {ok:left.length===0,count:pend.length-left.length,pending:left.length};});
}
function auditLocalEventsForDate(fecha){
  var synced=auditGetSynced(), pend=auditGetPending();
  return synced.concat(pend).filter(function(e){return fechaDiaEnRangoAudit(e.fecha_dia);});
}
function auditEnsureSyncLoop(user){
  if(window.__aaAuditLoopStarted)return;
  window.__aaAuditLoopStarted=true;
  window.addEventListener('online',function(){auditSyncPending();});
  setInterval(function(){auditSyncPending();},30000);
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){
      if(user)auditRecord(user,'sistema','App reactivada / vuelve a primer plano',{resultado:navigator.onLine?'online':'offline'});
      auditSyncPending();
    }
  });
}

/* ═══════════════════════════
   PDF BOLETA
═══════════════════════════ */
/* ═══════════════════════════
   BOLETA — HTML PREVIEW + EXPORT
═══════════════════════════ */

// Render boleta as pure HTML string for preview, print, and image
function boletaHTML(ped){
  var items=(ped.itemsFinales||ped.items).filter(function(it){
    var c=it.cantFinal!==undefined?it.cantFinal:it.cant;
    return c>0;
  });
  var sub=items.reduce(function(s,it){var c=it.cantFinal!==undefined?it.cantFinal:it.cant;var d=parseFloat(it.descPct)||0;return s+c*it.pu*(1-d/100);},0);
  var descAmt=sub*(ped.descPct/100);
  var total=sub-descAmt;
  var cli=ped.cliente||{};

  function halfHtml(label){
    return '<div style="width:100%;padding:16px 18px;font-family:Arial,sans-serif;font-size:12px;color:#111;box-sizing:border-box">'+
      '<div style="text-align:center;margin-bottom:8px">'+
        '<div style="font-size:22px;font-weight:900;color:#1F4788;letter-spacing:1px">'+
          '<span style="color:#E31E24">ALISTA </span>AHORRO</div>'+
        '<div style="font-size:10px;color:#666;margin-top:2px">Los Juríes, Santiago del Estero · Tel: (03862) 424500</div>'+
      '</div>'+
      '<div style="text-align:center;border:2px solid #1F4788;border-radius:4px;padding:4px;margin-bottom:8px">'+
        '<div style="font-size:13px;font-weight:700">BOLETA N° '+ped.nPedido+'   ['+label+']</div>'+
        '<div style="font-size:10px;color:#555">Fecha: '+(ped.fecha||'—')+'   Vendedor: '+(ped.preventistaNombre||'—')+'</div>'+
      '</div>'+
      '<div style="background:#f0f4fc;border-radius:4px;padding:6px 8px;margin-bottom:8px;font-size:11px">'+
        '<div><b>Cliente:</b> '+(cli.nombre||'')+' '+(cli.apellido||'')+'</div>'+
        '<div><b>Domicilio:</b> '+(cli.dir||'—')+'</div>'+
        '<div><b>Teléfono:</b> '+(cli.tel||'—')+'</div>'+
      '</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px">'+
        '<thead>'+
          '<tr style="background:#1F4788;color:#fff">'+
            '<th style="padding:4px 6px;text-align:left">Código</th>'+
            '<th style="padding:4px 6px;text-align:left">Descripción</th>'+
            '<th style="padding:4px 6px;text-align:right">Cant.</th>'+
            '<th style="padding:4px 6px;text-align:right">P. Unit.</th>'+
            '<th style="padding:4px 6px;text-align:right">Subtotal</th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>'+
          items.map(function(it,i){
            var c=it.cantFinal!==undefined?it.cantFinal:it.cant;
            var bg=i%2===0?'#f8f9fb':'#fff';
            return '<tr style="background:'+bg+'">'+
              '<td style="padding:3px 6px">'+it.cod+'</td>'+
              '<td style="padding:3px 6px">'+it.desc+'</td>'+
              '<td style="padding:3px 6px;text-align:right">'+c+'</td>'+
              '<td style="padding:3px 6px;text-align:right">$'+(it.pu||0).toLocaleString('es-AR',{minimumFractionDigits:2})+'</td>'+
              '<td style="padding:3px 6px;text-align:right">$'+(c*(it.pu||0)*(1-((parseFloat(it.descPct)||0)/100))).toLocaleString('es-AR',{minimumFractionDigits:2})+'</td>'+
            '</tr>';
          }).join('')+
        '</tbody>'+
      '</table>'+
      '<div style="border-top:2px solid #1F4788;padding-top:6px;text-align:right;font-size:12px">'+
        '<div>Subtotal: $'+sub.toLocaleString('es-AR',{minimumFractionDigits:2})+'</div>'+
        (ped.descPct>0?'<div style="color:#c00">Descuento ('+ped.descPct+'%): -$'+descAmt.toLocaleString('es-AR',{minimumFractionDigits:2})+'</div>':'')+
        '<div style="font-size:15px;font-weight:900;color:#1F4788;margin-top:4px">TOTAL: $'+total.toLocaleString('es-AR',{minimumFractionDigits:2})+'</div>'+
      '</div>'+
      '<div style="text-align:center;margin-top:8px;font-size:10px;color:#888">'+
        '<div><i>Revisar bien antes de retirarse</i></div>'+
        '<div>Conserve su comprobante · ALISTA AHORRO</div>'+
      '</div>'+
    '</div>';
  }

  return '<div id="boleta-inner" style="width:794px;background:#fff;margin:0 auto">'+
    halfHtml('ORIGINAL')+
    '<div style="border-top:2px dashed #999;margin:4px 18px;text-align:center;font-size:9px;color:#bbb;padding:2px 0">✂ cortar aquí</div>'+
    halfHtml('DUPLICADO')+
  '</div>';
}

// makePDF: generate using jsPDF (for backwards compat)
function makePDF(pedido){
  try{
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var W=doc.internal.pageSize.getWidth();
    var H=doc.internal.pageSize.getHeight();
    var mid=H/2;
    var items=(pedido.itemsFinales||pedido.items).filter(function(it){
      var c=it.cantFinal!==undefined?it.cantFinal:it.cant;return c>0;
    });

    function half(y0,label){
      var y=y0+8;
      doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(31,71,136);
      doc.text('ALISTA AHORRO',W/2,y,{align:'center'});y+=6;
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90,90,90);
      doc.text('Los Juríes, Santiago del Estero · Tel: (03862) 424500',W/2,y,{align:'center'});y+=7;
      doc.setFillColor(31,71,136);doc.rect(14,y-4,W-28,10,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(255,255,255);
      doc.text('BOLETA N° '+pedido.nPedido+'   ['+label+']',W/2,y+2,{align:'center'});y+=8;
      doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(30,30,30);
      doc.text('Fecha: '+pedido.fecha+'   Vendedor: '+pedido.preventistaNombre,14,y);y+=5;
      doc.setFillColor(240,244,252);doc.rect(14,y-3,W-28,14,'F');
      doc.setFontSize(8);
      doc.text('Cliente: '+(pedido.cliente.nombre+' '+pedido.cliente.apellido),16,y);y+=4;
      doc.text('Domicilio: '+(pedido.cliente.dir||'—'),16,y);y+=4;
      doc.text('Teléfono: '+(pedido.cliente.tel||'—'),16,y);y+=6;
      // Table header
      doc.setFillColor(31,71,136);doc.rect(14,y-3,W-28,7,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(255,255,255);
      doc.text('CÓD',16,y+1);doc.text('DESCRIPCIÓN',36,y+1);
      doc.text('CANT',100,y+1,{align:'right'});doc.text('P.UNIT',130,y+1,{align:'right'});
      doc.text('SUBTOTAL',W-16,y+1,{align:'right'});y+=8;
      doc.setFont('helvetica','normal');doc.setTextColor(30,30,30);
      items.forEach(function(it,i){
        var cant=it.cantFinal!==undefined?it.cantFinal:it.cant;
        if(i%2===0){doc.setFillColor(248,249,251);doc.rect(14,y-3,W-28,5.5,'F');}
        doc.setFontSize(7.5);
        doc.text(it.cod,16,y);
        var dn=it.desc.length>30?it.desc.slice(0,30)+'…':it.desc;
        doc.text(dn,36,y);doc.text(String(cant),100,y,{align:'right'});
        doc.text('$'+$(it.pu),130,y,{align:'right'});
        doc.text('$'+$(cant*it.pu*(1-((parseFloat(it.descPct)||0)/100))),W-16,y,{align:'right'});y+=5.5;
      });
      y+=2;doc.setDrawColor(31,71,136);doc.setLineWidth(0.8);doc.line(14,y,W-14,y);y+=5;
      doc.setFontSize(9);doc.setTextColor(60,60,60);
      doc.text('Subtotal:',110,y,{align:'right'});doc.text('$'+$(pedido.sub),W-16,y,{align:'right'});y+=5;
      if(pedido.descPct>0){
        doc.setTextColor(180,0,0);
        doc.text('Descuento ('+pedido.descPct+'%):',110,y,{align:'right'});
        doc.text('-$'+$(pedido.descAmt),W-16,y,{align:'right'});y+=5;
      }
      doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(31,71,136);
      doc.text('TOTAL:',110,y,{align:'right'});doc.text('$'+$(pedido.total),W-16,y,{align:'right'});y+=8;
      doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(180,0,0);
      doc.text('Revisar bien antes de retirarse',W/2,y,{align:'center'});y+=4;
      doc.setFont('helvetica','normal');doc.setTextColor(150,150,150);
      doc.text('Conserve su comprobante · ALISTA AHORRO',W/2,y,{align:'center'});
    }

    half(0,'ORIGINAL');
    doc.setDrawColor(160,160,160);doc.setLineDash([3,3]);doc.line(8,mid,W-8,mid);
    doc.setLineDash([]);doc.setFontSize(7);doc.setTextColor(180,180,180);
    doc.text('✂ cortar aquí',W/2,mid+3,{align:'center'});
    half(mid+5,'DUPLICADO');
    doc.save('Boleta_N'+pedido.nPedido+'_'+((pedido.cliente.nombre||'')+'_'+(pedido.cliente.apellido||'')).replace(/\s+/g,'_')+'.pdf');
  }catch(err){console.error('PDF error',err);}
}

// BoletaModal: preview + export options
function BoletaModal(props){
  var ped=props.ped;
  var previewRef=useRef(null);
  var _l=useState(false),loading=_l[0],setLoading=_l[1];
  var _s=useState(''),status=_s[0],setStatus=_s[1];

  useEffect(function(){
    if(previewRef.current)previewRef.current.innerHTML=boletaHTML(ped);
  },[]);

  function doDownloadPDF(){makePDF(ped);}

  function doImage(download){
    var el=previewRef.current&&previewRef.current.querySelector('#boleta-inner');
    if(!el||typeof html2canvas==='undefined'){alert('Función no disponible.');return;}
    setLoading(true);setStatus('Generando imagen…');
    html2canvas(el,{scale:2,backgroundColor:'#ffffff',logging:false}).then(function(canvas){
      var fname='Boleta_N'+ped.nPedido+'_'+((ped.cliente.nombre||'')+'_'+(ped.cliente.apellido||'')).replace(/\s+/g,'_')+'.png';
      if(download){
        var a=document.createElement('a');a.download=fname;a.href=canvas.toDataURL('image/png');
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setStatus('');setLoading(false);
      } else {
        // Share
        canvas.toBlob(function(blob){
          var file=new File([blob],fname,{type:'image/png'});
          if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
            navigator.share({files:[file],title:'Boleta #'+ped.nPedido,text:'Boleta de ALISTA AHORRO'})
              .then(function(){setLoading(false);setStatus('');})
              .catch(function(){setLoading(false);setStatus('No se pudo compartir.');});
          } else {
            // Fallback: download
            var a=document.createElement('a');a.download=fname;a.href=URL.createObjectURL(blob);
            document.body.appendChild(a);a.click();document.body.removeChild(a);
            setLoading(false);setStatus('Compartir no disponible en este dispositivo. Imagen descargada.');
          }
        },'image/png');
      }
    }).catch(function(){setLoading(false);setStatus('Error al generar imagen.');});
  }

  function doPrint(){
    var el=previewRef.current&&previewRef.current.querySelector('#boleta-inner');
    if(!el)return;
    var printDiv=document.getElementById('boleta-print')||document.createElement('div');
    printDiv.id='boleta-print';
    printDiv.innerHTML=el.outerHTML;
    if(!document.getElementById('boleta-print'))document.body.appendChild(printDiv);
    window.print();
  }

  var canShare=typeof navigator!=='undefined'&&!!navigator.share;

  return E('div',{className:'ov',onClick:props.onClose},
    E('div',{style:{background:'#fff',borderRadius:'16px 16px 0 0',width:'100%',maxWidth:860,
      maxHeight:'95vh',overflow:'hidden',display:'flex',flexDirection:'column',
      boxShadow:'0 -4px 32px rgba(0,0,0,.2)'},
      onClick:function(e){e.stopPropagation();}},
      /* Header */
      E('div',{style:{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}},
        E('div',null,
          E('div',{style:{fontWeight:700,fontSize:16,color:'var(--blue)'}},'🧾 Boleta N° '+ped.nPedido),
          E('div',{style:{fontSize:12,color:'var(--txt2)'}},ped.cliente.nombre+' '+ped.cliente.apellido)
        ),
        E('button',{className:'mcl',onClick:props.onClose},'×')
      ),
      /* Action buttons */
      E('div',{style:{padding:'12px 20px',borderBottom:'1px solid var(--border)',display:'flex',gap:8,flexWrap:'wrap',flexShrink:0}},
        E('button',{className:'btn pri',onClick:doDownloadPDF,disabled:loading},'📄 PDF'),
        E('button',{className:'btn ok',onClick:function(){doImage(true);},disabled:loading},'🖼 Imagen (PNG)'),
        E('button',{className:'btn',onClick:doPrint,disabled:loading},'🖨️ Imprimir'),
        canShare&&E('button',{className:'btn teal',onClick:function(){doImage(false);},disabled:loading},'📤 Compartir'),
        loading&&E('span',{style:{fontSize:13,color:'var(--txt2)',alignSelf:'center'}},status||'Procesando…')
      ),
      /* Preview */
      E('div',{style:{flex:1,overflowY:'auto',padding:'16px',background:'#f0f2f8'}},
        status&&!loading&&E('div',{className:'alert warn',style:{marginBottom:12}},E('span',null,status)),
        E('div',{ref:previewRef,style:{background:'#fff',borderRadius:8,boxShadow:'0 2px 12px rgba(0,0,0,.1)',overflow:'hidden'}})
      )
    )
  );
}


function Alert(props){
  if(!props.msg)return null;
  return E('div',{className:'alert '+props.t},
    E('span',null,props.msg),
    props.onClose&&E('button',{onClick:props.onClose},'×')
  );
}
function Modal(props){
  function stopAll(e){e.stopPropagation();if(e.cancelable)e.preventDefault();}
  return E('div',{className:'ov',onClick:props.onClose,onTouchStart:function(e){e.stopPropagation();}},
    E('div',{className:'modal'+(props.xl?' xl':props.wide?' wide':''),
      onClick:function(e){e.stopPropagation();},
      onTouchStart:function(e){e.stopPropagation();}},
      E('div',{className:'mhd'},
        E('span',{className:'mhd-title'},props.title),
        E('button',{className:'mcl',onClick:props.onClose},'×')
      ),
      props.children
    )
  );
}
function PeriodBar(props){
  var tabs=[['hoy','Hoy'],['semana','7 días'],['mes','Mes'],['trim','Trimestre'],['anio','Año'],['todo','Todo']];
  return E('div',{className:'period-bar'},
    tabs.map(function(t){
      return E('button',{key:t[0],className:'ptab'+(props.val===t[0]?' on':''),onClick:function(){props.onChange(t[0]);}},t[1]);
    })
  );
}

/* ═══════════════════════════
   LEAFLET MAP — LIVE GPS
═══════════════════════════ */
function LeafletMap(props){
  var mapRef=useRef(null);
  var mapInst=useRef(null);
  var layersRef=useRef({markers:[],tracks:[]});
  var initRef=useRef(false);

  useEffect(function(){
    if(!mapRef.current||initRef.current)return;
    initRef.current=true;
    var isTouchDevice=(typeof window!=='undefined')&&((window.matchMedia&&window.matchMedia('(pointer: coarse)').matches)||('ontouchstart' in window));
    var m=L.map(mapRef.current,{
      zoomControl:true,
      attributionControl:true,
      dragging:!isTouchDevice,
      tap:false,
      touchZoom:!isTouchDevice,
      scrollWheelZoom:false
    })
      .setView(props.center||LOS_JURIOS,props.zoom||14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(m);
    mapInst.current=m;
    return function(){
      if(mapInst.current){mapInst.current.remove();mapInst.current=null;initRef.current=false;}
    };
  },[]);

  useEffect(function(){
    var m=mapInst.current;
    if(!m)return;
    layersRef.current.markers.forEach(function(l){l.remove();});
    layersRef.current.tracks.forEach(function(l){l.remove();});
    layersRef.current={markers:[],tracks:[]};
    var allLL=[];

    (props.tracks||[]).forEach(function(tr){
      if(!tr.points||tr.points.length<2)return;
      var lls=tr.points.map(function(p){return[p.lat,p.lng];});
      var pl=L.polyline(lls,{color:tr.color||'#E31E24',weight:5,opacity:0.85}).addTo(m);
      layersRef.current.tracks.push(pl);
      lls.forEach(function(ll){allLL.push(ll);});
    });

    (props.markers||[]).forEach(function(mk){
      if(mk.lat==null||mk.lng==null)return;
      var isMe=mk.isMe;
      var dot=isMe
        ? '<div style="width:22px;height:22px;background:'+mk.color+';border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.5)"></div>'
        : '<div style="width:13px;height:13px;background:'+mk.color+';border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>';
      var icon=L.divIcon({html:dot,className:'',iconSize:isMe?[22,22]:[13,13],iconAnchor:isMe?[11,11]:[6,6]});
      var marker=L.marker([mk.lat,mk.lng],{icon:icon,zIndexOffset:isMe?1000:0}).addTo(m);
      if(mk.popup)marker.bindPopup(mk.popup);
      layersRef.current.markers.push(marker);
      allLL.push([mk.lat,mk.lng]);
    });

    if(props.livePos){
      m.panTo([props.livePos.lat,props.livePos.lng],{animate:true,duration:0.6});
    } else if(allLL.length>1&&!props.noFit){
      try{m.fitBounds(allLL,{padding:[40,40],maxZoom:16});}catch(e){}
    } else if(allLL.length===1){
      m.setView(allLL[0],15);
    }
  },[props.markers,props.tracks,props.livePos]);

  return E('div',{ref:mapRef,className:'map-wrap',style:{height:props.height||'380px',width:'100%'}});
}

/* ═══════════════════════════
   GPS HOOK — real watchPosition
═══════════════════════════ */
function useGPS(user){
  var _a=useState(getGPSStatus(user.id)),gpsOn=_a[0],setGpsOn=_a[1];
  var _b=useState(null),pos=_b[0],setPos=_b[1];
  var _c=useState(''),gpsErr=_c[0],setGpsErr=_c[1];
  var watchId=useRef(null);
  var wakeRef=useRef(null); // keep screen awake
  var heartbeatRef=useRef(null); // respaldo: fuerza puntos periódicos aunque watchPosition se quede quieto

  function startGPS(){
    if(!navigator.geolocation){setGpsErr('Este dispositivo no tiene GPS.');return;}
    var info=gpsJornadaInfo();
    if(!info.puedeIniciar){setGpsErr(info.msg);return;}
    setGpsErr('');
    sl('gps_started_at_'+user.id,{ts:Date.now(),fecha:nowStr()});
    auditRecord(user,'recorrido','Inicio / activación de GPS',{resultado:navigator.onLine?'online':'offline'});
    setGPSStatus(user.id,true);
    setGpsOn(true);
    function guardarPosicion(p){
      var lat=p.coords.latitude,lng=p.coords.longitude;
      setPos({lat:lat,lng:lng,acc:p.coords.accuracy});
      saveGPSPoint(user.id,lat,lng,user);
      sl('gps_last_'+user.id,{lat:lat,lng:lng,ts:Date.now(),nombre:user.nombre||user.username,acc:p.coords.accuracy});
    }
    function pedirWakeLock(){
      if(navigator.wakeLock){
        navigator.wakeLock.request('screen').then(function(lock){wakeRef.current=lock;}).catch(function(){});
      }
    }
    pedirWakeLock();
    // Punto inmediato al iniciar, para que el administrador vea señal rápido.
    navigator.geolocation.getCurrentPosition(function(p){guardarPosicion(p);},function(){},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
    // Respaldo: además del watchPosition, fuerza una lectura cada 15 segundos mientras la pantalla esté activa.
    if(heartbeatRef.current)clearInterval(heartbeatRef.current);
    heartbeatRef.current=setInterval(function(){
      if(!getGPSStatus(user.id))return;
      navigator.geolocation.getCurrentPosition(function(p){guardarPosicion(p);setGpsErr('');},function(err){
        if(err&&err.code===3)return; // timeout: no cortar recorrido
      },{enableHighAccuracy:true,timeout:20000,maximumAge:10000});
    },15000);
    watchId.current=navigator.geolocation.watchPosition(
      function(p){
        guardarPosicion(p);
      },
      function(err){
        var msgs={1:'Permiso GPS denegado. Andá a Ajustes > Privacidad > Ubicación y habilitá el navegador.',2:'GPS no disponible. Verificá que el GPS del teléfono esté activado.',3:'El GPS tardó demasiado. Intentá de nuevo al aire libre.'};
        setGpsErr(msgs[err.code]||'Error GPS: '+err.message);
        // Don't stop on timeout - retry automatically
        if(err.code===3){
          setTimeout(function(){
            if(watchId.current!==null){
              navigator.geolocation.clearWatch(watchId.current);
              watchId.current=navigator.geolocation.watchPosition(
                function(p){guardarPosicion(p);setGpsErr('');},
                function(){},
                {enableHighAccuracy:true,timeout:30000,maximumAge:5000}
              );
            }
          },3000);
        } else {
          setGpsOn(false);setGPSStatus(user.id,false);
        }
      },
      {enableHighAccuracy:true,timeout:30000,maximumAge:5000,distanceFilter:5}
    );
  }

  function stopGPS(){
    var info=gpsJornadaInfo();
    if(info.locked){setGpsErr(info.msg);return;}
    if(watchId.current!==null){navigator.geolocation.clearWatch(watchId.current);watchId.current=null;}
    if(heartbeatRef.current){clearInterval(heartbeatRef.current);heartbeatRef.current=null;}
    if(wakeRef.current){try{wakeRef.current.release();}catch(e){}wakeRef.current=null;}
    setGPSStatus(user.id,false);
    setGpsOn(false);
    sl('gps_last_'+user.id,null);
    sl('gps_stopped_at_'+user.id,{ts:Date.now(),fecha:nowStr()});
    auditRecord(user,'recorrido','Finalizó / apagó GPS',{resultado:navigator.onLine?'online':'offline'});
  }

  useEffect(function(){
    function onVisibleAgain(){
      if(document.visibilityState==='visible'&&getGPSStatus(user.id)){
        auditRecord(user,'sistema','App reactivada con GPS activo',{resultado:navigator.onLine?'online':'offline'});
        // Al volver a la pantalla, reanuda wake lock y fuerza un punto inmediato.
        if(navigator.wakeLock){navigator.wakeLock.request('screen').then(function(lock){wakeRef.current=lock;}).catch(function(){});}
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(function(p){
            var lat=p.coords.latitude,lng=p.coords.longitude;
            setPos({lat:lat,lng:lng,acc:p.coords.accuracy});
            saveGPSPoint(user.id,lat,lng,user);
            sl('gps_last_'+user.id,{lat:lat,lng:lng,ts:Date.now(),nombre:user.nombre||user.username,acc:p.coords.accuracy});
          },function(){},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
        }
      }
    }
    document.addEventListener('visibilitychange',onVisibleAgain);
    if(gpsOn&&watchId.current===null)startGPS();
    return function(){
      document.removeEventListener('visibilitychange',onVisibleAgain);
      if(watchId.current!==null){navigator.geolocation.clearWatch(watchId.current);watchId.current=null;}
      if(heartbeatRef.current){clearInterval(heartbeatRef.current);heartbeatRef.current=null;}
      if(wakeRef.current){try{wakeRef.current.release();}catch(e){}wakeRef.current=null;}
    };
  },[]);

  return {gpsOn:gpsOn,pos:pos,gpsErr:gpsErr,startGPS:startGPS,stopGPS:stopGPS};
}


/* ═══════════════════════════
   CANCEL MODAL (shared)
═══════════════════════════ */
var CANCEL_OPCIONES=[
  'Cliente no estaba disponible',
  'Cliente cambió de opinión',
  'Error en el pedido',
  'Problema de precio',
  'Otro (especificar)'
];

function CancelModal(props){
  // props: ped, user, onConfirm, onClose
  var _a=useState(''),opcion=_a[0],setOpcion=_a[1];
  var _b=useState(''),libre=_b[0],setLibre=_b[1];
  var _c=useState(''),err=_c[0],setErr=_c[1];

  var motivoFinal=(opcion==='Otro (especificar)'||!opcion)?libre:(opcion+(libre.trim()?': '+libre.trim():''));

  function confirmar(){
    if(!opcion){setErr('Seleccioná un motivo.');return;}
    if(motivoFinal.length<10){setErr('El motivo debe tener al menos 10 caracteres.');return;}
    props.onConfirm(motivoFinal);
  }

  return E(Modal,{title:'Cancelar Pedido #'+props.ped.nPedido,onClose:props.onClose},
    E('div',{style:{background:'#fff0f0',border:'1.5px solid #fca5a5',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13}},
      E('div',{style:{fontWeight:700,color:'var(--red)',marginBottom:4}},'⚠️ Esta acción no se puede deshacer'),
      E('div',{style:{color:'var(--txt2)'}},'El pedido quedará cancelado. Si necesitás uno nuevo, deberás crearlo desde cero.')
    ),
    E('div',{className:'fg'},E('label',null,'Motivo de cancelación ',E('em',null,'*')),
      E('select',{className:'fs',value:opcion,onChange:function(e){setOpcion(e.target.value);setErr('');}},
        E('option',{value:''},'— Seleccioná un motivo —'),
        CANCEL_OPCIONES.map(function(o){return E('option',{key:o,value:o},o);})
      )
    ),
    opcion&&E('div',{className:'fg'},
      E('label',null,opcion==='Otro (especificar)'?'Especificá el motivo *':'Detalle adicional (opcional)'),
      E('textarea',{className:'fi',rows:3,
        placeholder:opcion==='Otro (especificar)'?'Describí el motivo (mín. 10 caracteres)…':'Información adicional…',
        value:libre,onChange:function(e){setLibre(e.target.value);setErr('');},
        style:{resize:'vertical'}})
    ),
    err&&E('div',{style:{color:'var(--red)',fontSize:13,marginBottom:8,fontWeight:600}},err),
    E('div',{className:'brow',style:{marginTop:16}},
      E('button',{className:'btn dan',onClick:confirmar,style:{flex:1}},'🗑️ Confirmar Cancelación'),
      E('button',{className:'btn',onClick:props.onClose,style:{flex:1}},'← Volver')
    )
  );
}

function Login(props){
  var _a=useState(''),u=_a[0],setU=_a[1];
  var _b=useState(''),p=_b[0],setP=_b[1];
  var _c=useState(''),err=_c[0],setErr=_c[1];
  var _d=useState(false),loading=_d[0],setLoading=_d[1];

  function submit(e){
    if(e&&e.preventDefault)e.preventDefault();
    var un=(u||'').trim();
    var pw=(p||'').trim();
    if(!un||!pw){setErr('Completá usuario y contraseña.');return;}
    setLoading(true);setErr('');
    authLogin(un,pw)
      .then(function(profile){setLoading(false);props.onLogin(profile);})
      .catch(function(e){
        setLoading(false);
        var m=e&&e.message?e.message:'No se pudo iniciar sesión.';
        if(m.toLowerCase().indexOf('fetch')>=0)m='Sin conexión o servidor no disponible.';
        setErr(m);
      });
  }

  return E('div',{className:'login-bg',style:{overflowY:'auto',WebkitOverflowScrolling:'touch'}},
    E('div',{className:'login-box'},
      E('div',{className:'login-brand'},
        E('div',{className:'login-brand-name'},E('em',null,'ALISTA '),'AHORRO'),
        E('div',{className:'login-brand-sub'},'Sistema de Pedidos B2B')
      ),
      err&&E(Alert,{t:'err',msg:err,onClose:function(){setErr('');}}),
      E('form',{onSubmit:submit,autoComplete:'on'},
        E('div',{className:'lfield'},
          E('label',null,'Usuario'),
          E('input',{
            value:u,
            onChange:function(e){setU(e.target.value);},
            placeholder:'Usuario o email',
            autoComplete:'username',
            autoCapitalize:'none',
            autoCorrect:'off',
            spellCheck:false,
            inputMode:'text',
            disabled:loading,
            style:{fontSize:16}
          })
        ),
        E('div',{className:'lfield'},
          E('label',null,'Contraseña'),
          E('input',{
            type:'password',
            value:p,
            onChange:function(e){setP(e.target.value);},
            placeholder:'Contraseña',
            autoComplete:'current-password',
            disabled:loading,
            style:{fontSize:16}
          })
        ),
        E('button',{
          className:'login-btn',
          type:'submit',
          disabled:loading,
          style:{marginTop:8,WebkitAppearance:'none'}
        },loading?'Verificando…':'Ingresar')
      ),
      E('div',{style:{marginTop:16,fontSize:12,color:'var(--txt2)',lineHeight:1.4}},
        E('strong',null,'Ingreso seguro: '),'podés entrar con ',
        E('code',null,'ADMINISTRADOR'),', ',E('code',null,'CrisL'),' o ',E('code',null,'CR1'),'.'
      ),
      E('div',{style:{marginTop:14,textAlign:'center',fontSize:11,color:'var(--txt2)'}},BIZ.dir)
    )
  );
}

/* ═══════════════════════════
   SIDEBAR
═══════════════════════════ */
function Sidebar(props){
  var user=props.user;
  var isAdmin=user.role==='admin';
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isPrev=user.role==='preventista';
  var isPrep=user.role==='preparador';
  var pedidos=gl('pedidos',[]);
  var pendCount=pedidos.filter(function(p){return p.estado==='pendiente';}).length;
  var preparadoCount=pedidos.filter(function(p){return p.estado==='preparado'&&p.preventistaId===user.id;}).length;
  function nav(id,icon,label,badge){
    return E('button',{key:id,className:'nav-item'+(props.mod===id?' on':''),onClick:function(){props.setMod(id);}},
      E('span',{className:'nav-icon'},icon),label,
      badge>0&&E('span',{className:'notif-dot'})
    );
  }
  return E('div',{className:'sidebar'+(props.isOpen?' open':'')},
    E('div',{className:'sb-brand'},
      E('div',{className:'sb-brand-name'},E('em',null,'ALISTA '),'AHORRO'),
      E('div',{className:'sb-brand-sub'},'Sistema de Pedidos B2B')
    ),
    E('div',{className:'sb-user'},
      E('div',{className:'sb-user-name'},user.nombre||user.username),
      E('div',{className:'sb-role '+user.role},roleLabel(user.role))
    ),
    E('nav',{className:'sb-nav'},
      E('div',{className:'sb-section'},'Principal'),
      nav('dashboard','📊','Dashboard'),
      (isPrev||isAdminOrCo||isPrep)&&E('div',{className:'sb-section'},'Pedidos'),
      (isPrev||isAdminOrCo)&&nav('nuevo-pedido','🛒','Nuevo Pedido'),
      isPrev&&nav('ofertas','🔥','Ofertas Relámpago'),
      isPrev&&nav('mis-pedidos','📦','Mis Pedidos',preparadoCount),
      isPrev&&nav('jornada-caja','🧾','Jornada / Caja'),
      isPrev&&nav('mapa-gps','🗺️','Mi Recorrido GPS'),
      isPrev&&nav('clientes','👥','Clientes'),
      isPrev&&nav('cuentas-corrientes','💳','Cuentas Corrientes'),
      (isAdminOrCo||isPrep)&&nav('cola-prep','⚙️','Preparación',pendCount),
      isPrep&&nav('todos-pedidos','📋','Todos los Pedidos'),
      isAdminOrCo&&E('div',{className:'sb-section'},'Gestión'),
      isAdminOrCo&&nav('todos-pedidos','📋','Todos los Pedidos'),
      isAdminOrCo&&nav('mapa-admin','🗺️','Mapa Preventistas'),
      isAdminOrCo&&nav('auditoria','🧭','Auditoría Recorridos'),
      isAdminOrCo&&nav('objetivos','🎯','Objetivos Preventistas'),
      isAdminOrCo&&nav('ofertas','🔥','Ofertas Relámpago'),
      (!isPrev&&(isAdminOrCo||canClientes(user)!=='none'))&&nav('clientes','👥','Clientes'),
      isAdminOrCo&&nav('articulos','📦','Artículos'),
      isAdminOrCo&&nav('cuentas-corrientes','💳','Cuentas Corrientes'),
      !isAdminOrCo&&canClientes(user)!=='none'&&nav('cuentas-corrientes','💳','CC Cliente'),
      isAdminOrCo&&E('div',{className:'sb-section'},'Reportes'),
      isAdminOrCo&&nav('estadisticas','📈','Estadísticas'),
      isAdminOrCo&&nav('jornada-caja','🧾','Jornadas / Caja'),
      isAdminOrCo&&nav('comisiones','💵','Comisiones'),
      isAdminOrCo&&nav('usuarios','👤','Usuarios'),
      isAdmin&&nav('configuracion','⚙️','Configuración')
    ),
    E('div',{className:'sb-foot'},
      E('button',{className:'logout',onClick:props.onLogout},'← Cerrar Sesión')
    )
  );
}


/* ═══════════════════════════
   DASHBOARD
═══════════════════════════ */
function Dashboard(props){
  var user=props.user;
  var _a=useState([]),pedidos=_a[0],setPedidos=_a[1];
  var _v=useState([]),visitas=_v[0],setVisitas=_v[1];
  var _mov=useState([]),movs=_mov[0],setMovs=_mov[1];
  var _obj=useState([]),objetivos=_obj[0],setObjetivos=_obj[1];
  var _fd=useState((new Date()).toISOString().slice(0,10)),fechaDash=_fd[0],setFechaDash=_fd[1];
  var _pts=useState([]),gpsPts=_pts[0],setGpsPts=_pts[1];
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isPrev=user.role==='preventista';
  var isPrep=user.role==='preparador';

  function cargar(){
    dbGet('pedidos').then(function(rows){if(rows)setPedidos((Array.isArray(rows)?rows:[]).map(dbToPed));});
    dbGet('visitas').then(function(rows){if(Array.isArray(rows))setVisitas(rows);}).catch(function(){});
    dbGet('movimientos_cc').then(function(rows){if(Array.isArray(rows))setMovs(rows);}).catch(function(){});
    dbGet('objetivos_preventistas').then(function(rows){if(Array.isArray(rows))setObjetivos(rows.map(dbToObj));}).catch(function(){});
  }

  useEffect(function(){
    cargar();
    var iv=setInterval(cargar,10000);
    return function(){clearInterval(iv);};
  },[]);

  function dateInputToAR(v){
    if(!v)return todayStr();
    var p=String(v).split('-');
    if(p.length!==3)return v;
    return parseInt(p[2],10)+'/'+parseInt(p[1],10)+'/'+p[0];
  }
  function dateInputToGpsKey(v){return dateInputToAR(v).replace(/\//g,'-');}
  function fechaCoincide(fecha,v){return String(fecha||'').indexOf(dateInputToAR(v))>=0;}
  function pedidoFechaControl(p,v){return fechaCoincide(p.fechaEntregado||p.fechaPreparado||p.fecha,v)||fechaCoincide(p.fecha,v);}
  function esEntregado(p){return p.estado==='entregado'||p.estado==='finalizado';}
  function esRechazado(p){return p.estado==='cancelado'||((p.devoluciones||[]).length>0);}

  useEffect(function(){
    if(!isPrev)return;
    function refreshPts(){setGpsPts(getGPSPoints(user.id,dateInputToGpsKey(fechaDash)));}
    refreshPts();
    var iv=setInterval(refreshPts,5000);
    return function(){clearInterval(iv);};
  },[fechaDash,isPrev,user.id]);

  var mine=isPrev?pedidos.filter(function(p){return p.preventistaId===user.id;}):pedidos;
  var prepMine=isPrep?pedidos.filter(function(p){return p.preparadorId===user.id||p.estado==='pendiente'||p.estado==='listo_entrega';}):pedidos;

  function countBy(estado){return pedidos.filter(function(p){return p.estado===estado;}).length;}
  function countMine(estado){return mine.filter(function(p){return p.estado===estado;}).length;}

  var recientes=(isAdminOrCo?pedidos:(isPrep?pedidos:mine)).slice(-5).reverse();
  var basePedidos=isAdminOrCo?pedidos:(isPrep?prepMine:mine);
  var finalizadosDash=basePedidos.filter(function(p){return p.estado==='finalizado'||p.estado==='entregado'||p.estado==='listo_entrega'||p.estado==='preparado'||p.estado==='pendiente';});
  var visitasDash=visitas.filter(function(v){return isAdminOrCo||v.preventista_id===user.id;});
  var visitasFecha=visitasDash.filter(function(v){return fechaCoincide(v.fecha,fechaDash);});

  function topClientes(){
    var m={};
    finalizadosDash.forEach(function(p){
      var k=(p.cliente&&p.cliente.id)||((p.cliente&&p.cliente.nombre)||'Cliente');
      if(!m[k])m[k]={n:(p.cliente&&((p.cliente.nombreFantasia)||(p.cliente.nombre+' '+p.cliente.apellido)))||'Cliente',v:0,c:0};
      m[k].v+=parseFloat(p.total)||0;m[k].c++;
    });
    return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.v-a.v;}).slice(0,5);
  }
  function topArticulos(){
    var m={};
    finalizadosDash.forEach(function(p){(p.itemsFinales||p.items||[]).forEach(function(it){
      var k=it.artId||it.cod||it.desc;if(!m[k])m[k]={n:it.desc||it.cod,q:0,v:0};
      var q=it.cantFinal!==undefined?parseFloat(it.cantFinal)||0:parseFloat(it.cant)||0;
      m[k].q+=q;m[k].v+=q*(parseFloat(it.pu)||0);
    });});
    return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.q-a.q;}).slice(0,5);
  }
  var topC=topClientes(),topA=topArticulos();

  var prevPedidosFecha=mine.filter(function(p){return pedidoFechaControl(p,fechaDash);});
  var prevPendientes=mine.filter(function(p){return p.estado==='pendiente';}).length;
  var prevEntregados=prevPedidosFecha.filter(esEntregado).length;
  var prevRechazados=prevPedidosFecha.filter(esRechazado).length;
  var visitasClientesUnicos={};
  visitasFecha.forEach(function(v){if(v.cliente_id)visitasClientesUnicos[v.cliente_id]=true;});
  var clientesRecorridos=Object.keys(visitasClientesUnicos).length||visitasFecha.length;
  var objVigente=objetivos.filter(function(o){
    return o.activo!==false&&o.usuarioId===user.id&&(!o.fechaDesde||fechaDash>=o.fechaDesde)&&(!o.fechaHasta||fechaDash<=o.fechaHasta);
  }).sort(function(a,b){return String(b.fechaHasta||'').localeCompare(String(a.fechaHasta||''));})[0]||null;
  var pedidosDiaPrev=prevPedidosFecha.length;
  var ventasDiaPrev=prevPedidosFecha.filter(esEntregado).reduce(function(s,p){return s+(parseFloat(p.total)||0);},0);
  var cobrosDiaPrev=movs.filter(function(m){return m.usuario_id===user.id&&fechaCoincide(m.fecha,fechaDash)&&m.tipo==='credito';})
    .reduce(function(s,m){return s+(parseFloat(m.monto)||0);},0);

  var gpsTrack=gpsPts.filter(function(p){return p&&p.lat&&p.lng;});
  var visitaMarkers=visitasFecha.filter(function(v){return v.lat&&v.lng;}).map(function(v){return {lat:v.lat,lng:v.lng,color:'#1a9e5c',popup:'<strong>'+(v.cliente_nombre||'Visita')+'</strong><br>'+(v.fecha||'')+'<br>'+(v.observaciones||'')};});
  var rutaTrack=gpsTrack.length>1?[{points:gpsTrack,color:'#E31E24'}]:[];

  var prepPorPreparar=pedidos.filter(function(p){return p.estado==='pendiente';}).length;
  var prepPreparados=pedidos.filter(function(p){return p.preparadorId===user.id&&(p.estado==='listo_entrega'||p.estado==='preparado')&&fechaCoincide(p.fechaPreparado||p.fecha,fechaDash);}).length;
  var prepEntregados=pedidos.filter(function(p){return p.preparadorId===user.id&&esEntregado(p)&&fechaCoincide(p.fechaEntregado||p.fecha,fechaDash);}).length;
  var prepControlados=pedidos.filter(function(p){return p.preparadorId===user.id&&(fechaCoincide(p.fechaPreparado||p.fecha,fechaDash)||fechaCoincide(p.fechaEntregado||'',fechaDash));}).length;
  var prepCierres=pedidos.filter(function(p){return p.preparadorId===user.id&&(p.estado==='entregado'||p.estado==='finalizado');}).sort(function(a,b){return String(b.fechaEntregado||b.fecha).localeCompare(String(a.fechaEntregado||a.fecha));}).slice(0,5);

  return E('div',null,
    E('div',{className:'kpi-row'},
      isAdminOrCo&&E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pendientes'),E('div',{className:'kpi-val'},countBy('pendiente'))),
      isAdminOrCo&&E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Listos para entregar'),E('div',{className:'kpi-val'},countBy('listo_entrega'))),
      isAdminOrCo&&E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Entregados'),E('div',{className:'kpi-val'},countBy('entregado')+countBy('finalizado'))),
      isAdminOrCo&&E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Finalizados Hoy'),E('div',{className:'kpi-val'},
        pedidos.filter(function(p){return esEntregado(p)&&fechaCoincide(p.fechaEntregado||p.fecha,(new Date()).toISOString().slice(0,10));}).length
      )),
      isPrev&&E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Clientes recorridos'),E('div',{className:'kpi-val'},clientesRecorridos)),
      isPrev&&E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pedidos para preparar'),E('div',{className:'kpi-val'},prevPendientes)),
      isPrev&&E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Pedidos entregados'),E('div',{className:'kpi-val'},prevEntregados)),
      isPrev&&E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Pedidos rechazados'),E('div',{className:'kpi-val'},prevRechazados)),
      isPrep&&E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pedidos por preparar'),E('div',{className:'kpi-val'},prepPorPreparar)),
      isPrep&&E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Pedidos preparados'),E('div',{className:'kpi-val'},prepPreparados)),
      isPrep&&E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Pedidos entregados'),E('div',{className:'kpi-val'},prepEntregados)),
      isPrep&&E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Pedidos controlados'),E('div',{className:'kpi-val'},prepControlados))
    ),

    (isPrev||isPrep)&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},isPrev?'📍 Dashboard del preventista':'⚙️ Dashboard del preparador'),
        E('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
          E('span',{style:{fontSize:12,color:'var(--txt2)',fontWeight:700}},'Fecha'),
          E('input',{className:'fi sm',type:'date',value:fechaDash,onChange:function(e){setFechaDash(e.target.value);},style:{width:155}})
        )
      ),
      isPrev&&E('div',null,
        E('div',{className:'kpi-row'},
          E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Visitas registradas'),E('div',{className:'kpi-val'},visitasFecha.length)),
          E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Puntos GPS'),E('div',{className:'kpi-val'},gpsTrack.length)),
          E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Pedidos del día'),E('div',{className:'kpi-val'},prevPedidosFecha.length))
        ),
        objVigente?E('div',{style:{background:'#f8fafc',border:'1.5px solid var(--border)',borderRadius:10,padding:12,marginBottom:12}},
          E('div',{style:{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}},
            E('div',{style:{fontWeight:800,color:'var(--blue)'}},'🎯 Objetivos del período'),
            E('div',{style:{fontSize:12,color:'var(--txt2)'}},(objVigente.fechaDesde||'')+' al '+(objVigente.fechaHasta||''))
          ),
          E(ObjetivoBar,{label:'Visitas',act:visitasFecha.length,obj:objVigente.objetivoVisitas}),
          E(ObjetivoBar,{label:'Pedidos',act:pedidosDiaPrev,obj:objVigente.objetivoPedidos}),
          E(ObjetivoBar,{label:'Ventas',act:ventasDiaPrev,obj:objVigente.objetivoVentas,valueText:'$'+$i(ventasDiaPrev)+' / $'+$i(objVigente.objetivoVentas)}),
          E(ObjetivoBar,{label:'Cobranza',act:cobrosDiaPrev,obj:objVigente.objetivoCobranza,valueText:'$'+$i(cobrosDiaPrev)+' / $'+$i(objVigente.objetivoCobranza)})
        ):E('div',{className:'alert warn',style:{marginBottom:12}},E('span',null,'No tenés objetivos cargados para esta fecha. El administrador puede cargarlos desde Objetivos Preventistas.')),
        E('div',{style:{fontWeight:700,marginBottom:8}},'🗺️ Ruta del recorrido'),
        gpsTrack.length>1?E(LeafletMap,{height:'330px',tracks:rutaTrack,markers:visitaMarkers,noFit:false}):E('div',{className:'empty'},'Todavía no hay recorrido GPS para la fecha seleccionada. Iniciá recorrido desde Mi Recorrido GPS.'),
        visitasFecha.length>0&&E('div',{style:{marginTop:10,fontSize:12,color:'var(--txt2)'}},'Visitas/cobros registrados: '+visitasFecha.length)
      ),
      isPrep&&E('div',null,
        E('div',{style:{fontWeight:700,marginBottom:8}},'Últimos pedidos cerrados por este preparador'),
        prepCierres.length?E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Pedido'),E('th',null,'Cliente'),E('th',null,'Pago'),E('th',null,'Entregado'),E('th',null,'Total'))),
          E('tbody',null,prepCierres.map(function(p){return E('tr',{key:p.id},
            E('td',null,'#'+p.nPedido),
            E('td',null,p.cliente.nombreFantasia||p.cliente.nombre+' '+p.cliente.apellido),
            E('td',null,p.formaPago||'—'),
            E('td',null,p.fechaEntregado||'—'),
            E('td',null,E('strong',null,'$'+$(p.total)))
          );}))
        )):E('div',{className:'empty'},'Todavía no hay pedidos cerrados por este preparador.')
      )
    ),

    isAdminOrCo&&E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'📍 Control general de recorrido y ventas')),
      E('div',{className:'kpi-row'},
        E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Visitas hoy'),E('div',{className:'kpi-val'},visitas.filter(function(v){return fechaCoincide(v.fecha,(new Date()).toISOString().slice(0,10));}).length)),
        E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Negocios visitados'),E('div',{className:'kpi-val'},visitasDash.length)),
        E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Pedidos controlados'),E('div',{className:'kpi-val'},basePedidos.length))
      ),
      E('div',{className:'grid2'},
        E('div',null,
          E('div',{style:{fontWeight:700,marginBottom:8}},'🏪 Negocios que más compraron'),
          topC.length?E('div',{style:{display:'flex',flexDirection:'column',gap:6}},topC.map(function(x,i){return E('div',{key:i,style:{display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--border)',padding:'4px 0'}},E('span',null,x.n),E('strong',null,'$'+$(x.v)));})):E('div',{className:'empty'},'Sin datos todavía.')
        ),
        E('div',null,
          E('div',{style:{fontWeight:700,marginBottom:8}},'📦 Artículos más vendidos'),
          topA.length?E('div',{style:{display:'flex',flexDirection:'column',gap:6}},topA.map(function(x,i){return E('div',{key:i,style:{display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--border)',padding:'4px 0'}},E('span',null,x.n),E('strong',null,x.q+' u.'));})):E('div',{className:'empty'},'Sin datos todavía.')
        )
      )
    ),

    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'📋 Últimos Pedidos')),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'N°'),E('th',null,'Cliente'),
          (isAdminOrCo||isPrep)&&E('th',null,'Preventista'),
          E('th',null,'Total'),E('th',null,'Estado'),E('th',null,'Fecha')
        )),
        E('tbody',null,recientes.length===0?E('tr',null,E('td',{colSpan:6,className:'empty'},'Sin pedidos aún.')):
          recientes.map(function(p){
            return E('tr',{key:p.id},
              E('td',null,E('strong',null,'#'+p.nPedido)),
              E('td',null,p.cliente.nombre+' '+p.cliente.apellido),
              (isAdminOrCo||isPrep)&&E('td',null,p.preventistaNombre),
              E('td',null,E('strong',{style:{color:'var(--blue)'}},'$'+$(p.total))),
              E('td',null,E('span',{className:'st '+p.estado},estadoLabel(p.estado))),
              E('td',null,fechaSolo(p.fecha))
            );
          })
        )
      ))
    )
  );
}

/* ═══════════════════════════
   NUEVO PEDIDO (Preventista)
═══════════════════════════ */
function NuevoPedido(props){
  var user=props.user;
  var _a0=useState([]),arts=_a0[0],setArts=_a0[1];
  var _a=useState([]),clis=_a[0],setClis=_a[1];
  var _b=useState(null),cli=_b[0],setCli=_b[1];
  var _c=useState([]),items=_c[0],setItems=_c[1];
  var _d=useState(0),desc=_d[0],setDesc=_d[1];
  var _e=useState(''),nota=_e[0],setNota=_e[1];
  var _f=useState(''),qCli=_f[0],setQCli=_f[1];
  var _g=useState(''),qArt=_g[0],setQArt=_g[1];
  var _h=useState(false),showCli=_h[0],setShowCli=_h[1];
  var _i=useState(null),msg=_i[0],setMsg=_i[1];
  var _j=useState([]),serverArtsPedido=_j[0],setServerArtsPedido=_j[1];
  var _k=useState(false),searchingPedido=_k[0],setSearchingPedido=_k[1];
  var _cl=useState(false),loadingClientes=_cl[0],setLoadingClientes=_cl[1];
  var _sc=useState([]),serverClisPedido=_sc[0],setServerClisPedido=_sc[1];
  var _cs=useState(false),searchingClientes=_cs[0],setSearchingClientes=_cs[1];
  var _ofp=useState([]),ofertasPedido=_ofp[0],setOfertasPedido=_ofp[1];
  var _jor=useState(null),jornadaActiva=_jor[0],setJornadaActiva=_jor[1];
  var _jload=useState(true),loadingJornada=_jload[0],setLoadingJornada=_jload[1];

  useEffect(function(){
    // V42: no cargar todos los artículos al iniciar Nuevo Pedido.
    // En celulares con listas grandes esto trababa al preventista.
    // Ahora los artículos se buscan directamente en Supabase al escribir 2 letras.
    setArts([]);
    setLoadingClientes(true);
    dbGetClientesLight().then(function(rows){if(rows)setClis(rows.map(dbToCli).filter(function(c){return c.estado==='activo';}));})
      .finally(function(){setLoadingClientes(false);});
    dbGet('ofertas_preventistas').then(function(rows){if(rows)setOfertasPedido((Array.isArray(rows)?rows:[]).map(dbToOferta).filter(function(o){return ofertaVigente(o);}));}).catch(function(){});
    if(user.role==='preventista'){getTurnoActivo(user).then(function(t){setJornadaActiva(t);setLoadingJornada(false);}).catch(function(){setLoadingJornada(false);});}else{setLoadingJornada(false);}
  },[]);

  useEffect(function(){
    var term=(qCli||'').trim();
    if(term.length<2){setServerClisPedido([]);setSearchingClientes(false);return;}
    var cancel=false;
    setSearchingClientes(true);
    dbSearchClientes(term).then(function(rows){
      if(cancel)return;
      setServerClisPedido((rows||[]).map(dbToCli).filter(function(c){return c.estado==='activo';}));
      setSearchingClientes(false);
    }).catch(function(){if(!cancel)setSearchingClientes(false);});
    return function(){cancel=true;};
  },[qCli]);

  useEffect(function(){
    var term=(qArt||'').trim();
    if(term.length<2){setServerArtsPedido([]);setSearchingPedido(false);return;}
    var cancel=false;
    setSearchingPedido(true);
    dbSearchArticulos(term).then(function(rows){
      if(cancel)return;
      setServerArtsPedido((rows||[]).map(dbToArt).filter(function(a){return a.estado==='activo';}));
      setSearchingPedido(false);
    }).catch(function(){if(!cancel)setSearchingPedido(false);});
    return function(){cancel=true;};
  },[qArt]);

  var maxDesc=getMaxDesc(user.id,user);
  var sub=items.reduce(function(s,i){return s+(i.cant*i.pu*(1-(i.descPct||0)/100));},0);
  var costoPedido=items.reduce(function(s,i){return s+(i.cant||0)*(parseFloat(i.costo)||0);},0);
  var maxDescGeneral=maxGeneralDescByCost(sub,costoPedido,maxDesc);
  var descAplicado=Math.min(Math.max(0,parseFloat(desc)||0),maxDescGeneral);
  var descAmt=sub*(descAplicado/100);
  var total=sub-descAmt;

  function addArt(a){
    var pp=precioPedidoConOferta(a,ofertasPedido);
    var of=pp.oferta;
    var idx=items.findIndex(function(i){return i.artId===a.id;});
    if(idx>=0){var u=items.slice();var inc=itemEsPesable(u[idx])?0.1:1;u[idx]=Object.assign({},u[idx],{cant:normalizarCantidad((parseFloat(u[idx].cant)||0)+inc,itemEsPesable(u[idx]),itemEsPesable(u[idx])?0.001:1)});setItems(u);}
    else setItems(items.concat([{
      artId:a.id,cod:a.cod,codArt:a.codArt,desc:a.desc,cant:1,pesable:!!a.pesable,canPesable:!!a.pesable,
      pu:pp.precio,costo:artCostoUnitFromArt(a),precioPublico:artPrecioPublicoUnit(a),descPct:0,
      ofertaId:of?of.id:null,precioOferta:of?of.precioOferta:null,ofertaAplicada:!!of,precioRegularOferta:of?of.precioRegular:null
    }]));
  }
  function updItem(idx,k,v){
    var u=items.slice();u[idx]=Object.assign({},u[idx]);
    if(k==='cant')u[idx][k]=normalizarCantidad(v,itemEsPesable(u[idx]),itemEsPesable(u[idx])?0.001:1);
    else if(k==='pesable'){
      if(!!v&&!itemPermiteKg(u[idx])){flash('err','Este artículo no está marcado como PESABLE en el Excel. Solo los pesables pueden venderse por kg.');return;}
      u[idx].pesable=!!v;
      u[idx].cant=normalizarCantidad(u[idx].cant,!!v,!!v?0.001:1);
    }
    else if(k==='descPct'){var cap=maxLineDescByCost(u[idx],maxDesc);u[idx][k]=Math.min(cap,Math.max(0,parseFloat(v)||0));}
    else u[idx][k]=parseFloat(v)||0;
    setItems(u);
  }
  function remItem(idx){setItems(items.filter(function(_,i){return i!==idx;}));}

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4000);}

  function handleEnviar(){
    if(user.role==='preventista'&&!jornadaActiva){flash('err','Primero tenés que iniciar jornada/caja. No se puede facturar sin jornada abierta.');return;}
    if(!cli){flash('err','Seleccioná un cliente.');return;}
    if(items.length===0){flash('err','Agregá al menos un artículo.');return;}
    flash('ok','Enviando pedido…');
    dbGet('pedidos').then(function(rows){
      var maxN=rows&&rows.length?Math.max.apply(null,rows.map(function(r){return r.n_pedido||0;})):100;
      var n=maxN+1;
      var ped={
        id:uid(),nPedido:n,fecha:nowStr(),
        estado:'pendiente',
        turnoId:jornadaActiva&&jornadaActiva.id||null,
        preventistaId:user.id,preventistaNombre:user.nombre||user.username,
        cliente:{id:cli.id,nombre:cli.nombre,apellido:cli.apellido,
          nombreFantasia:cli.nombreFantasia||'',dir:cli.dir,tel:cli.tel},
        items:items,
        sub:sub,descPct:descAplicado,descAmt:descAmt,total:total,
        nota:nota,
        gpsCreacion:gl('gps_last_'+user.id,null),
        devoluciones:[],rendicion:null,
        canceladoPor:null,canceladoFecha:null,canceladoMotivo:null
      };
      dbUpsert('pedidos',pedToDb(ped)).then(function(result){
        if(!result){
          flash('err','Error al guardar el pedido. Verificá la conexión y el SQL de Supabase.');
          return;
        }
        auditRecord(user,'pedido','Pedido cargado',{cliente_id:cli.id,cliente_nombre:(cli.nombreFantasia||cli.nombre+' '+cli.apellido),pedido_id:ped.id,monto:total,resultado:'pedido_enviado',observaciones:'Pedido #'+n});
        flash('ok','✓ Pedido #'+n+' enviado a preparación.');
        setCli(null);setItems([]);setDesc(0);setNota('');setQCli('');
      }).catch(function(e){
        flash('err','Error al guardar: '+e.message);
      });
    }).catch(function(){
      flash('err','Error de conexión con Supabase. Verificá tu internet.');
    });
  }

  var baseClisPedido=(qCli&&qCli.trim().length>=2)?mergeByIdOrCode(clis,serverClisPedido):clis;
  var filtClis=baseClisPedido.filter(function(c){
    var hay=(c.nombre+' '+c.apellido+' '+(c.nombreFantasia||'')+' '+(c.tel||'')+' '+(c.dir||'')).toLowerCase();
    return c.estado==='activo'&&(!qCli||hay.indexOf(qCli.toLowerCase())>=0);
  }).slice(0,80);
  var artBasePedido=qArt&&qArt.trim().length>=2?mergeByIdOrCode(arts,serverArtsPedido):arts;
  var filtArts=artBasePedido.map(function(a){return {a:a,s:artScore(a,qArt)};})
    .filter(function(x){return x.a.estado==='activo'&&qArt&&qArt.trim().length>=2&&x.s>0;})
    .sort(function(x,y){return (y.s-x.s)||String(x.a.desc||'').localeCompare(String(y.a.desc||''),'es');})
    .slice(0,120)
    .map(function(x){return x.a;});

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    user.role==='preventista'&&loadingJornada&&E('div',{className:'card'},E('div',{className:'empty'},'Verificando jornada abierta…')),
    user.role==='preventista'&&!loadingJornada&&!jornadaActiva&&E('div',{className:'card'},E('div',{className:'card-title'},'🧾 Jornada requerida'),E('div',{className:'alert warn'},E('span',null,'Para tomar pedidos/facturar primero tenés que iniciar jornada. Esto permite cerrar caja y resumir efectivo, transferencias y cuenta corriente del turno.')),E('button',{className:'btn ok lg',onClick:function(){location.hash='';}},'Ir al menú Jornada / Caja')),
    E('div',{className:'card'},
      E('div',{className:'card-title'},'🛒 Nuevo Pedido'),
      E('div',{className:'fg'},
        E('label',null,'Cliente ',E('em',null,'*')),
        cli?E('div',{className:'cli-sel'},
          E('div',null,
            E('div',{style:{fontWeight:700}},cli.nombreFantasia||cli.nombre+' '+cli.apellido),
            cli.nombreFantasia&&E('div',{style:{fontSize:11,color:'var(--txt2)'}},cli.nombre+' '+cli.apellido),
            E('div',{style:{fontSize:12,color:'var(--txt2)',marginTop:2}},cli.dir+' · Tel: '+cli.tel)
          ),
          E('button',{className:'btn sm',onClick:function(){setCli(null);}}, 'Cambiar')
        ):E('div',null,
          E('div',{style:{display:'flex',gap:8,marginBottom:8}},
            E('input',{className:'fi',placeholder:'Buscar cliente…',value:qCli,
              onChange:function(e){setQCli(e.target.value);setShowCli(true);},style:{flex:1}}),
            E('button',{className:'btn',onClick:function(){setShowCli(!showCli);}},showCli?'▲':'▼ Ver todos')
          ),
          showCli&&E('div',{style:{maxHeight:260,overflowY:'auto',border:'1.5px solid var(--border)',borderRadius:8,padding:8}},
            loadingClientes?E('div',{className:'empty'},'Cargando clientes…'):
            searchingClientes?E('div',{className:'empty'},'Buscando clientes…'):
            filtClis.length===0?E('div',{className:'empty'},qCli&&qCli.trim().length<2?'Escribí al menos 2 letras para buscar rápido.':'Sin resultados.'):
            filtClis.map(function(c){
              return E('button',{key:c.id,className:'cli-item',onClick:function(){setCli(c);setShowCli(false);setQCli('');}},
                E('strong',null,c.nombreFantasia||c.nombre+' '+c.apellido),
                c.nombreFantasia&&E('span',{style:{fontSize:11,color:'var(--txt2)',marginLeft:6}},c.nombre+' '+c.apellido),
                E('span',{style:{fontSize:12,color:'var(--txt2)',marginLeft:8}},c.dir)
              );
            })
          )
        )
      )
    ),
    cli&&E('div',{className:'card'},
      E('div',{className:'card-title'},'📦 Artículos'),
      E('input',{className:'fi',placeholder:'Buscar por nombre o código… (ej: "coca 600" o "arroz 5kg")',
        value:qArt,onChange:function(e){setQArt(e.target.value);},style:{marginBottom:6}}),
      qArt.trim().length>0&&qArt.trim().length<2&&E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:8}},'Escribí al menos 2 letras para buscar.'),
      qArt.trim().length>=2&&E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:8}},
        filtArts.length===0?'Sin resultados para "'+qArt+'"':
        searchingPedido?'Buscando también en la base…':
        filtArts.length===120?'Mostrando los primeros 120 resultados. Afiná la búsqueda para ver más.':
        filtArts.length+' artículo'+(filtArts.length!==1?'s':'')+'encontrado'+(filtArts.length!==1?'s':'')+'.'
      ),
      (!qArt||qArt.trim().length<2)&&E('div',{style:{textAlign:'center',padding:'20px 0',color:'var(--txt2)',fontSize:13}},
        '🔍 Escribí al menos 2 letras. La búsqueda es rápida y no carga toda la lista en el teléfono.'
      ),
      filtArts.length>0&&E('div',{className:'art-list'},
        filtArts.map(function(a){
          return E('button',{key:a.id,className:'art-list-row',onClick:function(){addArt(a);}},
            E('div',{className:'art-list-info'},
              E('div',{className:'art-list-code'},a.cod+(a.codArt?' · '+a.codArt:'')),
              E('div',{className:'art-list-name'},a.desc),
              a.pesable&&E('div',{style:{fontSize:10,color:'var(--green)',fontWeight:700,marginTop:2}},'⚖ Se vende por kg')
            ),
            (function(){var of=ofertaActivaParaArticulo(ofertasPedido,a);return E('div',{className:'art-list-price'},
              of?E('span',{className:'offer-inline-price'},'🔥 $'+$(of.precioOferta)):('$'+$(artPrecioPublicoUnit(a))),
              of&&E('small',null,'Lista $'+$(artPrecioPublicoUnit(a)))
            );})(),
            E('div',{className:'art-list-add'},'+ Agregar')
          );
        })
      )
    ),
    items.length>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'📋 Detalle del Pedido'),
      E('div',{style:{display:'flex',gap:20,flexWrap:'wrap',alignItems:'flex-start'}},
        E('div',{style:{flex:'1 1 300px',overflowX:'auto'}},
          E('table',null,
            E('thead',null,E('tr',null,
              E('th',null,'Artículo'),E('th',null,'Cant.'),E('th',null,'Precio'),
              maxDesc>0&&E('th',null,'Desc.%'),E('th',null,'Subtotal'),E('th',null,'')
            )),
            E('tbody',null,items.map(function(it,i){
              var lineDesc=it.descPct||0;
              var lineSub=it.cant*it.pu*(1-lineDesc/100);
              return E('tr',{key:i},
                E('td',null,E('div',{style:{fontWeight:600,fontSize:13}},it.desc),it.ofertaAplicada&&E('div',{className:'offer-applied-badge'},'🔥 Oferta Relámpago aplicada'),E('div',{style:{fontSize:10,color:'var(--txt2)'}},it.cod)),
                E('td',null,
                  E('input',{className:'fi sm qty',type:'number',inputMode:'decimal',min:itemEsPesable(it)?0.001:1,step:qtyStep(it),value:it.cant,onChange:function(e){updItem(i,'cant',e.target.value);}}),
                  E('div',{style:{fontSize:10,color:itemEsPesable(it)?'var(--green)':'var(--txt2)',fontWeight:itemEsPesable(it)?700:400}},itemEsPesable(it)?'kg / acepta decimales':'unidades'),
                  itemPermiteKg(it)
                    ? E('button',{type:'button',className:'btn sm',style:{marginTop:4,fontSize:10,padding:'3px 6px'},onClick:function(){updItem(i,'pesable',!itemEsPesable(it));}},itemEsPesable(it)?'Cambiar a unidad':'Vender por kg')
                    : E('div',{style:{fontSize:10,color:'var(--txt2)',marginTop:4}},'No pesable')
                ),
                E('td',null,E('div',null,'$'+$(it.pu)),it.ofertaAplicada&&it.precioPublico&&E('del',{style:{display:'block',fontSize:10,color:'var(--txt2)'}},'$'+$(it.precioPublico)),lineDesc>0&&E('div',{style:{fontSize:10,color:'var(--red)'}},'-'+lineDesc+'%')),
                maxDesc>0&&E('td',null,E('input',{className:'fi sm qty',type:'number',min:0,max:maxDesc,step:0.5,
                  value:lineDesc,onChange:function(e){updItem(i,'descPct',e.target.value);},
                  style:{width:52,background:lineDesc>0?'#fef3c7':''},placeholder:'0'})),
                E('td',null,E('strong',{style:{color:lineDesc>0?'var(--green)':'inherit'}},'$'+$(lineSub))),
                E('td',null,E('button',{className:'btn sm dan',onClick:function(){remItem(i);}},'✕'))
              );
            }))
          )
        ),
        E('div',{className:'totals'},
          E('div',{className:'trow'},E('span',null,'Subtotal'),E('strong',null,'$'+$(sub))),
          desc>0&&E('div',{className:'trow'},E('span',null,'Desc. gral '+desc+'%'),E('span',{style:{color:'var(--red)',fontWeight:700}},'−$'+$(descAmt))),
          E('div',{className:'trow big'},E('span',null,'TOTAL'),E('span',null,'$'+$(total))),
          maxDesc>0&&E('div',{className:'fg',style:{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:10}},
            E('label',{style:{fontSize:12}},'Descuento general adicional (máx '+maxDescGeneral.toFixed(2)+'%)'),
            E('input',{className:'fi',type:'number',min:0,max:maxDescGeneral,step:0.5,value:desc,
              onChange:function(e){setDesc(Math.min(maxDescGeneral,parseFloat(e.target.value)||0));}}),
            maxDescGeneral<maxDesc&&E('div',{style:{fontSize:11,color:'var(--orange)',marginTop:4}},'Límite ajustado para no vender por debajo del costo.')
          )
        )
      ),
      E('div',{className:'fg',style:{marginTop:14}},
        E('label',null,'Nota adicional'),
        E('input',{className:'fi',placeholder:'Observaciones, preferencias del cliente…',value:nota,onChange:function(e){setNota(e.target.value);}})
      ),
      E('button',{className:'btn ok lg',onClick:handleEnviar,style:{width:'100%',marginTop:6}},
        '📤 Enviar Pedido a Preparación')
    )
  );
}

/* ═══════════════════════════
   MIS PEDIDOS (Preventista)
═══════════════════════════ */
function MisPedidos(props){
  var user=props.user;
  var _a=useState([]),pedidos=_a[0],setPedidos=_a[1];
  var _b=useState(null),detalle=_b[0],setDetalle=_b[1];
  var _c=useState(null),msg=_c[0],setMsg=_c[1];
  var _can=useState(null),cancelPed=_can[0],setCancelPed=_can[1];
  var _bm=useState(null),boletaModal=_bm[0],setBoletaModal=_bm[1];

  function reloadPeds(){dbGet('pedidos').then(function(rows){if(rows)setPedidos(rows.map(dbToPed));});}
  useEffect(function(){reloadPeds();var iv=setInterval(reloadPeds,8000);return function(){clearInterval(iv);};},[]);

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4000);}

  var mine=pedidos.filter(function(p){return p.preventistaId===user.id;}).sort(function(a,b){return b.nPedido-a.nPedido;});

  function retirar(ped){
    dbUpdate('pedidos',ped.id,pedToDb(Object.assign({},ped,{estado:'en_transito',fechaRetiro:nowStr()}))).then(reloadPeds);
    flash('ok','Pedido #'+ped.nPedido+' retirado. Estás en camino.');
  }

  function handleCancelar(motivo){
    var ped=cancelPed;
    var updPed=Object.assign({},ped,{
      estado:'cancelado',
      canceladoPor:user.nombre||user.username,
      canceladoFecha:nowStr(),
      canceladoMotivo:motivo
    });
    dbUpdate('pedidos',updPed.id,pedToDb(updPed)).then(function(){
      reloadPeds();setCancelPed(null);
      flash('warn','Pedido #'+ped.nPedido+' cancelado.');
    });
  }

  var grupos=[
    {label:'Listo para Retirar',estado:'listo_entrega',color:'var(--orange)',
      desc:'El preparador aprobó el pedido. Podés ir a buscarlo.'},
    {label:'En Tránsito (en ruta)',estado:'en_transito',color:'var(--purple)',
      desc:'Tenés el pedido con vos. Entregalo al cliente.'},
    {label:'Pendiente de Preparación',estado:'pendiente',color:'var(--txt2)',
      desc:'El preparador está armando el pedido.'},
    {label:'Preparado (esperando aprobación)',estado:'preparado',color:'var(--blue)',
      desc:'El preparador está revisando el pedido antes de aprobarlo.'},
    {label:'Entregados – Pendiente de Rendición',estado:'entregado',color:'var(--teal)',
      desc:'El preparador confirmó la entrega. Esperando rendición.'},
    {label:'Finalizados',estado:'finalizado',color:'var(--green)',desc:''},
    {label:'Cancelados',estado:'cancelado',color:'var(--red)',desc:''},
  ];

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),

    grupos.map(function(g){
      var group=mine.filter(function(p){return p.estado===g.estado;});
      if(g.estado==='finalizado'&&group.length===0)return null;
      if(g.estado!=='finalizado'&&group.length===0)return null;
      return E('div',{key:g.estado,className:'card'},
        E('div',{className:'card-hd'},
          E('div',{className:'card-title'},
            E('span',{style:{width:10,height:10,borderRadius:'50%',background:g.color,display:'inline-block',marginRight:6}}),
            g.label,' (',group.length,')'
          )
        ),
        g.desc&&E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:10}},g.desc),
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,
            E('th',null,'N°'),E('th',null,'Cliente'),E('th',null,'Total'),E('th',null,'Estado'),E('th',null,'')
          )),
          E('tbody',null,group.map(function(p){
            return E('tr',{key:p.id},
              E('td',null,E('strong',null,'#'+p.nPedido)),
              E('td',null,
                E('div',null,p.cliente.nombreFantasia||p.cliente.nombre+' '+p.cliente.apellido),
                p.notaPrep&&E('div',{style:{fontSize:11,color:'var(--orange)',marginTop:2}},'⚠️ '+p.notaPrep)
              ),
              E('td',null,'$'+$(p.total)),
              E('td',null,E('span',{className:'st '+p.estado},estadoLabel(p.estado))),
              E('td',null,E('div',{className:'brow'},
                E('button',{className:'btn sm',onClick:function(){setDetalle(p);}},'👁 Ver'),
                p.estado==='listo_entrega'&&E('button',{className:'btn sm purple',onClick:function(){retirar(p);}},
                  '📥 Retirar Pedido'),
                p.estado==='pendiente'&&E('button',{className:'btn sm dan',onClick:function(){setCancelPed(p);}},
                  '🗑️ Cancelar'),
                p.estado==='finalizado'&&E('button',{className:'btn sm',onClick:function(){setBoletaModal(p);}},'🖨️ Boleta')
              ))
            );
          }))
        ))
      );
    }),

    mine.length===0&&E('div',{className:'card'},
      E('div',{className:'empty'},'No tenés pedidos aún. Creá uno desde "Nuevo Pedido".')
    ),

    cancelPed&&E(CancelModal,{ped:cancelPed,user:user,
      onConfirm:handleCancelar,onClose:function(){setCancelPed(null);}}),

    detalle&&E(Modal,{title:'Pedido #'+detalle.nPedido,onClose:function(){setDetalle(null);},wide:true},
      E('div',{style:{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13}},
        E('div',null,'Cliente: ',E('strong',null,detalle.cliente.nombreFantasia||detalle.cliente.nombre+' '+detalle.cliente.apellido)),
        E('div',null,'Estado: ',E('span',{className:'st '+detalle.estado},estadoLabel(detalle.estado))),
        detalle.nota&&E('div',null,'Nota: ',detalle.nota)
      ),
      detalle.notaPrep&&E('div',{className:'alert warn'},E('span',null,'Nota del preparador: '+detalle.notaPrep)),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'Artículo'),E('th',null,'Pedido'),E('th',null,'A Entregar'),E('th',null,'P.Unit.'),E('th',null,'Subtotal')
        )),
        E('tbody',null,(detalle.itemsFinales||detalle.items).map(function(it,i){
          var cant=it.cantFinal!==undefined?it.cantFinal:it.cant;
          return E('tr',{key:i},
            E('td',null,E('div',{style:{fontWeight:600}},it.desc),
              it.motivo&&E('div',{style:{fontSize:11,color:'var(--red)'}},it.motivo)),
            E('td',null,it.cant),
            E('td',null,E('strong',{style:{color:cant<it.cant?'var(--orange)':'inherit'}},cant)),
            E('td',null,'$'+$(it.pu),(parseFloat(it.descPct)||0)>0&&E('div',{style:{fontSize:10,color:'var(--green)'}},'-'+(parseFloat(it.descPct)||0)+'%')),
            E('td',null,'$'+$(cant*it.pu*(1-((parseFloat(it.descPct)||0)/100))))
          );
        }))
      )),
      E('div',{style:{textAlign:'right',marginTop:12,fontSize:15,fontWeight:700,color:'var(--blue)'}},
        'TOTAL: $'+$(detalle.total)),
      E('div',{className:'brow',style:{marginTop:16,justifyContent:'flex-end'}},
        detalle.estado==='listo_entrega'&&E('button',{className:'btn purple',onClick:function(){retirar(detalle);setDetalle(null);}},
          '📥 Retirar este Pedido'),
        detalle.estado==='finalizado'&&E('button',{className:'btn',onClick:function(){setBoletaModal(detalle);setDetalle(null);}},'🖨️ Ver Boleta'),
        E('button',{className:'btn pri',onClick:function(){setDetalle(null);}},'Cerrar')
      )
    )
  );
}




/* ═══════════════════════════
   JORNADA / CAJA (Preventista)
═══════════════════════════ */
function JornadaCaja(props){
  var user=props.user;
  var isAdmin=user.role==='admin'||user.role==='coadmin';
  var _t=useState(null),turno=_t[0],setTurno=_t[1];
  var _ts=useState([]),turnos=_ts[0],setTurnos=_ts[1];
  var _p=useState([]),pedidos=_p[0],setPedidos=_p[1];
  var _m=useState([]),movs=_m[0],setMovs=_m[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];
  var _obs=useState(''),obs=_obs[0],setObs=_obs[1];

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},5000);}
  function reload(){
    Promise.all([getTurnoActivo(user),dbGet('turnos_jornada'),dbGet('pedidos'),dbGet('movimientos_cc')]).then(function(r){
      setTurno(r[0]);setTurnos((r[1]||[]).map(dbToTurno).sort(function(a,b){return String(b.fechaInicio).localeCompare(String(a.fechaInicio));}));setPedidos((r[2]||[]).map(dbToPed));setMovs(r[3]||[]);
    }).catch(function(){flash('err','No se pudo cargar jornada. Ejecutá el SQL V47 si todavía no lo hiciste.');});
  }
  useEffect(function(){reload();},[]);

  function iniciar(){
    getTurnoActivo(user).then(function(t){
      if(t){setTurno(t);flash('warn','Ya tenés una jornada abierta. Cerrala antes de abrir otra.');return;}
      var nuevo={id:uid(),usuarioId:user.id,usuarioNombre:user.nombre||user.username,fechaInicio:nowStr(),estado:'abierto',gpsInicio:gl('gps_last_'+user.id,null),resumen:{},observaciones:''};
      setTurnoActivoLocal(user.id,nuevo);
      dbUpsert('turnos_jornada',turnoToDb(nuevo)).then(function(){auditRecord(user,'jornada','Inicio de jornada',{resultado:'abierta'});setTurno(nuevo);reload();flash('ok','Jornada iniciada. Ya podés tomar pedidos/facturar.');})
        .catch(function(e){flash('err','No se pudo iniciar jornada: '+e.message);});
    });
  }
  function cerrar(){
    if(!turno){flash('err','No tenés jornada abierta.');return;}
    var cerrado=Object.assign({},turno,{fechaCierre:nowStr(),estado:'cerrado',gpsCierre:gl('gps_last_'+user.id,null),observaciones:obs||''});
    var resumen=resumenTurnoDesdeDatos(cerrado,pedidos,movs);
    cerrado.resumen=resumen;
    dbUpdate('turnos_jornada',cerrado.id,turnoToDb(cerrado)).then(function(){setTurnoActivoLocal(user.id,null);auditRecord(user,'jornada','Cierre de jornada',{monto:resumen.totalGeneral,resultado:'cerrada',observaciones:'Pedidos '+resumen.pedidos+' · Total $'+$(resumen.totalGeneral)});setTurno(null);setObs('');reload();flash('ok','Jornada cerrada. Se guardó el resumen de caja/turno.');})
      .catch(function(e){flash('err','No se pudo cerrar jornada: '+e.message);});
  }
  function exportar(){
    var rows=(isAdmin?turnos:turnos.filter(function(t){return t.usuarioId===user.id;})).map(function(t){var r=t.resumen||{};return {'Preventista':t.usuarioNombre,'Estado':t.estado,'Inicio':t.fechaInicio,'Cierre':t.fechaCierre||'','Pedidos':r.pedidos||0,'Vendido':r.totalVendido||0,'Efectivo pedidos':r.efectivo||0,'Transferencias pedidos':r.transferencia||0,'Cuenta corriente enviada':r.cuentaCorriente||0,'Cobros efectivo':r.cobrosEfectivo||0,'Cobros transferencia':r.cobrosTransferencia||0,'Total caja':r.totalCaja||0,'Total general':r.totalGeneral||0,'Obs':t.observaciones||''};});
    exportXLSX([{name:'Jornadas',rows:rows}],'jornadas_caja_alista.xlsx');
  }
  var resumenActual=turno?resumenTurnoDesdeDatos(turno,pedidos,movs):null;
  var historial=(isAdmin?turnos:turnos.filter(function(t){return t.usuarioId===user.id;})).slice(0,20);
  function detalleLista(titulo,arr,campoExtra){return E('div',{className:'card',style:{marginTop:10}},E('div',{className:'card-title'},titulo),(!arr||!arr.length)?E('div',{className:'empty'},'Sin movimientos.'):E('div',{className:'tw'},E('table',null,E('thead',null,E('tr',null,E('th',null,'Fecha'),E('th',null,'Cliente'),E('th',null,'Pedido'),E('th',null,'Monto'),campoExtra&&E('th',null,campoExtra))),E('tbody',null,arr.map(function(x,i){return E('tr',{key:i},E('td',null,x.fecha||''),E('td',null,x.cliente||''),E('td',null,x.pedido?'#'+x.pedido:'—'),E('td',null,'$'+$(x.monto)),campoExtra&&E('td',null,x.datos||x.forma||x.referencia||''));})))));}
  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'🧾 Jornada / Caja por turno'),E('div',{className:'brow'},E('button',{className:'btn',onClick:reload},'🔄 Actualizar'),E('button',{className:'btn ok',onClick:exportar},'📊 Excel'))),
      E('div',{className:'alert warn'},E('span',null,'El preventista debe iniciar jornada antes de tomar pedidos. Al cerrar, queda asentado efectivo, transferencias, cuenta corriente y cobros del turno.')),
      turno?E('div',null,
        E('div',{className:'alert ok'},E('span',null,'Jornada abierta desde '+turno.fechaInicio)),
        resumenActual&&E('div',{className:'kpis'},
          E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Pedidos turno'),E('div',{className:'kpi-val'},resumenActual.pedidos||0)),
          E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Efectivo pedidos'),E('div',{className:'kpi-val'},'$'+$(resumenActual.efectivo))),
          E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Transferencias'),E('div',{className:'kpi-val'},'$'+$(resumenActual.transferencia))),
          E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Cuenta Corriente enviada'),E('div',{className:'kpi-val'},'$'+$(resumenActual.cuentaCorriente))),
          E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Total caja esperado'),E('div',{className:'kpi-val'},'$'+$(resumenActual.totalCaja)))
        ),
        E('div',{className:'fg'},E('label',null,'Observaciones de cierre'),E('textarea',{className:'fi',rows:2,value:obs,onChange:function(e){setObs(e.target.value);},placeholder:'Ej: transferencia pendiente, diferencia de efectivo, comprobante enviado…'})),
        E('button',{className:'btn dan lg',style:{width:'100%'},onClick:function(){if(confirm('¿Cerrar jornada y guardar resumen del turno?'))cerrar();}},'🔒 Cerrar jornada / caja'),
        resumenActual&&detalleLista('💵 Efectivo por pedidos',resumenActual.efectivoDetalle),
        resumenActual&&detalleLista('🏦 Transferencias por pedidos',resumenActual.transferenciasDetalle,'Comprobante / datos'),
        resumenActual&&detalleLista('💳 Cuenta corriente enviada en pedidos',resumenActual.ccDetalle),
        resumenActual&&detalleLista('🧾 Cobros de cuenta corriente recibidos',resumenActual.cobrosDetalle,'Forma / ref')
      ):E('div',null,
        E('div',{className:'empty'},'No tenés jornada abierta.'),
        E('button',{className:'btn ok lg',style:{width:'100%'},onClick:iniciar},'▶️ Iniciar jornada')
      )
    ),
    E('div',{className:'card'},
      E('div',{className:'card-title'},isAdmin?'Historial de jornadas':'Mis últimos cierres'),
      historial.length===0?E('div',{className:'empty'},'Sin jornadas registradas.'):
      E('div',{className:'tw'},E('table',null,E('thead',null,E('tr',null,E('th',null,'Preventista'),E('th',null,'Inicio'),E('th',null,'Cierre'),E('th',null,'Estado'),E('th',null,'Pedidos'),E('th',null,'Caja'),E('th',null,'Total'))),E('tbody',null,historial.map(function(t){var r=t.resumen||{};return E('tr',{key:t.id},E('td',null,t.usuarioNombre),E('td',null,t.fechaInicio),E('td',null,t.fechaCierre||'—'),E('td',null,E('span',{className:'st '+(t.estado==='abierto'?'pendiente':'finalizado')},t.estado)),E('td',null,r.pedidos||0),E('td',null,'$'+$(r.totalCaja||0)),E('td',null,'$'+$(r.totalGeneral||0)));}))))
    )
  );
}

/* ═══════════════════════════
   MAPA GPS (Preventista)
═══════════════════════════ */
function MapaGPS(props){
  var user=props.user;
  var gps=useGPS(user);
  var _a=useState(getGPSPoints(user.id,null)),pts=_a[0],setPts=_a[1];
  var _b=useState(true),follow=_b[0],setFollow=_b[1];
  var _c=useState([]),clientes=_c[0],setClientes=_c[1];
  var _d=useState([]),visitasHoy=_d[0],setVisitasHoy=_d[1];
  var _e=useState(null),visitaModal=_e[0],setVisitaModal=_e[1];
  var _f=useState(''),obsText=_f[0],setObsText=_f[1];
  var _g=useState(null),msg=_g[0],setMsg=_g[1];

  useEffect(function(){
    dbGet('clientes').then(function(rows){if(rows)setClientes(rows.map(dbToCli).filter(function(c){return c.estado==='activo'&&c.lat;}));});
    // Load today's visits
    var hoy=todayStr();
    dbGet('visitas').then(function(rows){
      if(rows)setVisitasHoy(rows.filter(function(v){return v.preventista_id===user.id&&v.fecha&&v.fecha.startsWith(hoy.split('/').reverse().join('-'));}));
    });
  },[]);

  useEffect(function(){setPts(getGPSPoints(user.id,null));},[gps.pos]);
  useEffect(function(){var iv=setInterval(function(){setPts(getGPSPoints(user.id,null));},4000);return function(){clearInterval(iv);};},[]);

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},3000);}

  function registrarVisita(cli){
    if(!gps.pos){flash('err','Necesitás tener el GPS activo para registrar una visita.');return;}
    setVisitaModal(cli);
    setObsText('');
  }

  function confirmarVisita(){
    var cli=visitaModal;
    var visita={
      id:uid(),cliente_id:cli.id,cliente_nombre:cli.nombre+' '+cli.apellido,
      preventista_id:user.id,preventista_nombre:user.nombre||user.username,
      fecha:nowStr(),lat:gps.pos.lat,lng:gps.pos.lng,
      observaciones:obsText.trim()||null
    };
    dbUpsert('visitas',visita).then(function(){
      auditRecord(user,'visita','Visita registrada',{cliente_id:cli.id,cliente_nombre:(cli.nombreFantasia||cli.nombre+' '+cli.apellido),resultado:'visitado',observaciones:visita.observaciones||''});
      setVisitasHoy(function(v){return v.concat([visita]);});
      setVisitaModal(null);
      flash('ok','Visita a '+cli.nombre+' registrada.');
    });
  }

  var visitaIds=visitasHoy.map(function(v){return v.cliente_id;});
  var mapHeight=window.innerHeight>700?'380px':'260px';

  var clienteMarkers=clientes.map(function(c){
    var visitado=visitaIds.indexOf(c.id)>=0;
    return {lat:c.lat,lng:c.lng,color:visitado?'#1a9e5c':'#1F4788',isMe:false,
      popup:'<strong>'+(c.nombreFantasia||c.nombre+' '+c.apellido)+'</strong><br>'+c.dir+'<br>'+(visitado?'✅ Visitado hoy':'')};
  });
  var posMarker=gps.pos?[{lat:gps.pos.lat,lng:gps.pos.lng,color:'#E31E24',isMe:true,
    popup:'<strong>📍 Vos</strong>'+(gps.pos.acc?'<br>±'+Math.round(gps.pos.acc)+'m':'')}]:[];
  var allMarkers=clienteMarkers.concat(posMarker);
  var track=pts.length>1?[{points:pts,color:'#E31E24'}]:[];
  var lockInfo=gpsJornadaInfo();

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    gps.gpsErr&&E(Alert,{t:'err',msg:gps.gpsErr}),

    /* GPS Control Bar - simple and clear */
    E('div',{className:'card',style:{padding:'14px 16px',marginBottom:12}},
      !gps.gpsOn
        ? E('div',{style:{textAlign:'center'}},
            E('div',{style:{fontSize:15,fontWeight:700,marginBottom:8,color:'var(--txt2)'}},
              '📍 GPS apagado'),
            E('div',{style:{fontSize:13,color:'var(--txt2)',marginBottom:14,lineHeight:1.6}},
              'Presioná el botón para empezar a registrar tu recorrido en el mapa. Se habilita desde las 08:00. Para transmitir continuo, dejá esta pantalla abierta y evitá bloquear el teléfono.'),
            E('button',{className:'btn ok lg full',onClick:gps.startGPS,disabled:!lockInfo.puedeIniciar},
              lockInfo.puedeIniciar?'▶ Iniciar Recorrido':'🔒 Disponible desde las 08:00')
          )
        : E('div',null,
            E('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:10}},
              E('div',{style:{display:'flex',alignItems:'center',gap:8}},
                E('span',{className:'gps-dot on'}),
                E('span',{style:{fontWeight:700,fontSize:14}},'GPS Activo · transmitiendo cada 15 s'),
                gps.pos&&E('span',{style:{fontSize:12,color:'var(--txt2)'}},'±'+Math.round(gps.pos.acc||0)+'m')
              ),
              E('button',{className:'btn dan sm',onClick:gps.stopGPS,disabled:lockInfo.locked,
                title:lockInfo.locked?lockInfo.msg:''},lockInfo.locked?'🔒 Hasta '+lockInfo.unlock:'⏹ Finalizar Jornada')
            ),
            E('div',{style:{display:'flex',gap:8}},
              E('button',{className:'btn sm '+(follow?'pri':''),style:{flex:1},onClick:function(){setFollow(!follow);}},
                follow?'🎯 Mapa te sigue':'🎯 Seguir mi posición'),
              E('span',{style:{fontSize:12,color:lockInfo.locked?'var(--orange)':'var(--txt2)',alignSelf:'center',fontWeight:lockInfo.locked?700:400}},
                (lockInfo.locked?lockInfo.msg+' · ':'')+pts.length+' puntos · '+visitasHoy.length+' visitas')
            )
          )
    ),

    /* Map */
    E('div',{className:'card',style:{padding:0,overflow:'hidden',marginBottom:12}},
      E(LeafletMap,{center:LOS_JURIOS,zoom:14,markers:allMarkers,tracks:track,
        livePos:follow&&gps.pos?gps.pos:null,noFit:gps.gpsOn,height:mapHeight})
    ),

    /* Clientes para visitar */
    gps.gpsOn&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'👥 Registrar Visita a Cliente'),
        E('span',{style:{fontSize:12,color:'var(--txt2)'}},'Tocá un cliente para registrar la visita')
      ),
      clientes.length===0?E('div',{className:'empty'},'No hay clientes con ubicación GPS cargada.'):
      E('div',{style:{display:'flex',flexDirection:'column',gap:8}},
        clientes.map(function(c){
          var visitado=visitaIds.indexOf(c.id)>=0;
          return E('button',{key:c.id,
            style:{padding:'12px 14px',border:'1.5px solid '+(visitado?'#86efac':'var(--border)'),
              borderRadius:8,background:visitado?'#f0fdf4':'#fff',
              textAlign:'left',cursor:'pointer',fontFamily:'inherit',
              display:'flex',justifyContent:'space-between',alignItems:'center'},
            onClick:function(){if(!visitado)registrarVisita(c);}},
            E('div',null,
              E('div',{style:{fontWeight:700,fontSize:14}},c.nombreFantasia||c.nombre+' '+c.apellido),
              E('div',{style:{fontSize:12,color:'var(--txt2)'}},c.dir)
            ),
            visitado
              ?E('span',{style:{color:'var(--green)',fontWeight:700,fontSize:13}},'✅ Visitado')
              :E('span',{style:{color:'var(--blue)',fontSize:13}},'+ Registrar')
          );
        })
      )
    ),

    /* Modal confirmar visita */
    visitaModal&&E(Modal,{title:'Registrar Visita',onClose:function(){setVisitaModal(null);}},
      E('div',{style:{background:'var(--bg)',borderRadius:8,padding:'12px 14px',marginBottom:14}},
        E('div',{style:{fontWeight:700,fontSize:15}},visitaModal.nombreFantasia||visitaModal.nombre+' '+visitaModal.apellido),
        E('div',{style:{fontSize:13,color:'var(--txt2)',marginTop:4}},visitaModal.dir),
        gps.pos&&E('div',{style:{fontSize:12,color:'var(--green)',marginTop:4}},
          '📍 Ubicación registrada: ±'+Math.round(gps.pos.acc||0)+'m de precisión')
      ),
      E('div',{className:'fg'},
        E('label',null,'Observaciones (opcional)'),
        E('textarea',{className:'fi',rows:3,placeholder:'Ej: Cliente pidió más stock, cambió de horario, tiene deuda pendiente…',
          value:obsText,onChange:function(e){setObsText(e.target.value);},
          style:{resize:'vertical',minHeight:80}})
      ),
      E('div',{className:'brow',style:{marginTop:16}},
        E('button',{className:'btn ok',onClick:confirmarVisita,style:{flex:1}},'✅ Confirmar Visita'),
        E('button',{className:'btn',onClick:function(){setVisitaModal(null);},style:{flex:1}},'Cancelar')
      )
    )
  );
}


// V36: helper global para que MapaAdmin no se quede en blanco al renderizar puntos GPS remotos.
function safePopupTxt(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(ch){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}

/* ═══════════════════════════
   MAPA ADMIN (Todos los Preventistas)
═══════════════════════════ */
function MapaAdmin(){
  var _u=useState(gl('users',[]).filter(function(u){return u.role==='preventista';})),users=_u[0],setUsers=_u[1];
  var _a=useState([]),posiciones=_a[0],setPosiciones=_a[1];
  var _b=useState(null),selectedUser=_b[0],setSelectedUser=_b[1];
  var _g=useState([]),gpsRemotos=_g[0],setGpsRemotos=_g[1];

  var colors=['#E31E24','#e07b10','#7c3aed','#0891b2','#1a9e5c'];
  function fechaISOHoy(){return (new Date()).toISOString().slice(0,10);}
  function remotePointsFor(id){
    var hoy=fechaISOHoy();
    return gpsRemotos.filter(function(p){return String(p.usuario_id)===String(id)&&String(p.fecha_dia||'').slice(0,10)===hoy&&p.lat&&p.lng;})
      .map(function(p){return {lat:parseFloat(p.lat),lng:parseFloat(p.lng),ts:parseInt(p.ts,10)||Date.parse(p.created_at||'')||Date.now()};})
      .sort(function(a,b){return (a.ts||0)-(b.ts||0);});
  }
  function trackFor(id){var r=remotePointsFor(id);return r.length?r:getGPSPoints(id,null);}
  function lastFor(u){
    var r=remotePointsFor(u.id);if(r.length)return Object.assign({},r[r.length-1],{remoto:true,nombre:u.nombre||u.username});
    return gl('gps_last_'+u.id,null);
  }

  useEffect(function(){
    function update(){
      dbGet('usuarios').then(function(rows){
        if(Array.isArray(rows)&&rows.length)setUsers(rows.map(dbToUser).filter(function(u){return u.role==='preventista'&&u.activo!==false;}));
      }).catch(function(){});
      dbGet('gps_puntos').then(function(rows){if(Array.isArray(rows))setGpsRemotos(rows);}).catch(function(){});
    }
    update();
    var iv=setInterval(update,8000);
    return function(){clearInterval(iv);};
  },[]);

  useEffect(function(){
    var pos=users.map(function(u){return Object.assign({},u,{lastPos:lastFor(u)});});
    setPosiciones(pos);
  },[users,gpsRemotos]);

  var markers=posiciones.filter(function(u){return u.lastPos;}).map(function(u,i){
    return {lat:u.lastPos.lat,lng:u.lastPos.lng,color:colors[i%colors.length],
      popup:'<strong>'+safePopupTxt(u.nombre||u.username)+'</strong><br>'+(u.lastPos.remoto?'GPS sincronizado':'GPS local')+'<br>'+new Date(u.lastPos.ts).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})};
  });

  var tracks=selectedUser?[{
    points:trackFor(selectedUser),
    color:colors[Math.max(0,users.findIndex(function(u){return u.id===selectedUser;}))%colors.length]
  }]:[];

  return E('div',null,
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🗺️ Ubicación de Preventistas'),
        E('div',{className:'brow'},
          E('select',{className:'fs',style:{width:'auto'},value:selectedUser||'',
            onChange:function(e){setSelectedUser(e.target.value||null);}},
            E('option',{value:''},'— Ver recorrido de —'),
            users.map(function(u){return E('option',{key:u.id,value:u.id},u.nombre||u.username);})
          )
        )
      ),
      E('div',{className:'alert ok',style:{marginBottom:12}},E('span',null,'V35: el recorrido GPS se sincroniza con Supabase. Si el preventista tiene GPS activo, el administrador puede verlo desde otro teléfono o computadora.')),
      posiciones.length===0?E('div',{className:'empty'},'No hay preventistas cargados.'):
      E('div',{style:{marginBottom:12,display:'flex',gap:8,flexWrap:'wrap'}},
        posiciones.map(function(u,i){
          return E('div',{key:u.id,style:{display:'flex',alignItems:'center',gap:6,fontSize:12}},
            E('span',{style:{width:10,height:10,borderRadius:'50%',background:colors[i%colors.length],display:'inline-block'}}),
            u.nombre||u.username, u.lastPos?E('span',{style:{color:'var(--green)',fontWeight:700}},' (GPS activo)')
                                :E('span',{style:{color:'var(--txt2)'}},' (sin GPS)')
          );
        })
      ),
      E(LeafletMap,{center:LOS_JURIOS,zoom:12,markers:markers,tracks:tracks,height:'460px'})
    )
  );
}

/* ═══════════════════════════
   COLA PREPARACIÓN
═══════════════════════════ */
function ColaPreparacion(props){
  var user=props.user;
  var isAdminPrep=user.role==='admin'||user.role==='coadmin';
  var isPreparador=user.role==='preparador';
  var _a=useState([]),pedidos=_a[0],setPedidos=_a[1];
  var _arts=useState([]),catalogo=_arts[0],setCatalogo=_arts[1];

  // Modal: preparar pedido (Paso 1)
  var _b=useState(null),prepModal=_b[0],setPrepModal=_b[1];
  var _c=useState([]),prepItems=_c[0],setPrepItems=_c[1];
  var _d=useState(''),notaPrep=_d[0],setNotaPrep=_d[1];
  var _descPrep=useState(0),prepDescPct=_descPrep[0],setPrepDescPct=_descPrep[1];
  var _qArt=useState(''),qArt=_qArt[0],setQArt=_qArt[1];
  var _pick=useState(null),picker=_pick[0],setPicker=_pick[1]; // null | 'add' | idx (replace)

  // Modal: boleta (Paso 2)
  var _bm=useState(null),boletaModal=_bm[0],setBoletaModal=_bm[1];

  // Modal: rendición (Paso 3)
  var _rm=useState(null),rendModal=_rm[0],setRendModal=_rm[1];
  var _rstep=useState(1),rendStep=_rstep[0],setRendStep=_rstep[1];
  var _hasDev=useState(null),hasDev=_hasDev[0],setHasDev=_hasDev[1];
  var _devItems=useState([]),devItems=_devItems[0],setDevItems=_devItems[1];
  var _rf=useState({efectivo:0,transferencia:0,datosTrans:'',cuentaCorriente:0,obs:''}),rendForm=_rf[0],setRendForm=_rf[1];

  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];

  function reload(){
    dbGet('pedidos').then(function(rows){if(rows)setPedidos(rows.map(dbToPed));})
      .catch(function(){flash('err','Error al cargar pedidos de Supabase.');});
  }
  useEffect(function(){
    reload();
    dbGet('articulos').then(function(rows){if(rows)setCatalogo(rows.map(dbToArt).filter(function(a){return a.estado==='activo';}));});
    var iv=setInterval(reload,7000);
    return function(){clearInterval(iv);};
  },[]);

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},5000);}
  function RF(k,v){setRendForm(function(f){return Object.assign({},f,{[k]:v});});}

  // ─── PASO 1: PREPARAR ───────────────────────────────────
  function abrirPrep(ped){
    setPrepModal(ped);
    setPrepItems((ped.items||[]).map(function(it){
      return normalizePedidoItemPrecio(Object.assign({},it,{cantFinal:it.cantFinal!==undefined?it.cantFinal:it.cant,motivo:it.motivo||'',tipo:it.tipo||'original'}),catalogo);
    }));
    setNotaPrep('');setPrepDescPct(parseFloat(ped.descPct)||0);setPicker(null);setQArt('');
  }

  function setIF(idx,k,v){
    setPrepItems(function(prev){
      var u=prev.slice();u[idx]=Object.assign({},u[idx]);
      if(k==='cantFinal')u[idx][k]=normalizarCantidad(v,itemEsPesable(u[idx]),0);
      else if(k==='pesable'){
        if(!!v&&!itemPermiteKg(u[idx])){flash('err','Este artículo no está marcado como PESABLE en el Excel. Solo los pesables pueden venderse por kg.');return prev;}
        u[idx].pesable=!!v;
        u[idx].cantFinal=normalizarCantidad(u[idx].cantFinal,!!v,0);
      }
      else if(k==='pu')u[idx][k]=Math.max(parseFloat(u[idx].costo)||0,parseFloat(v)||0);
      else if(k==='descPct'){var cap=maxLineDescByCost(u[idx],maxDesc);u[idx][k]=Math.min(cap,Math.max(0,parseFloat(v)||0));}
      else u[idx][k]=v;
      return u;
    });
  }

  function reemplazar(idx,art){
    setPrepItems(function(prev){
      var u=prev.slice();
      u[idx]=Object.assign({},u[idx],{cantFinal:0,motivo:'Reemplazado por '+art.desc,tipo:'original'});
      var rep={artId:art.id,cod:art.cod,codArt:art.codArt,desc:art.desc,
        cant:u[idx].cant,cantFinal:u[idx].cant,pesable:!!art.pesable,canPesable:!!art.pesable,pu:artPrecioPublicoUnit(art),costo:artCostoUnitFromArt(art),precioPublico:artPrecioPublicoUnit(art),
        tipo:'reemplazo',motivo:'Reemplazo de '+u[idx].desc};
      u.splice(idx+1,0,rep);
      return u;
    });
    setPicker(null);setQArt('');
  }

  function agregarArt(art){
    setPrepItems(function(prev){
      return prev.concat([{artId:art.id,cod:art.cod,codArt:art.codArt,
        desc:art.desc,cant:1,cantFinal:1,pesable:!!art.pesable,canPesable:!!art.pesable,pu:artPrecioPublicoUnit(art),costo:artCostoUnitFromArt(art),precioPublico:artPrecioPublicoUnit(art),
        tipo:'agregado',motivo:''}]);
    });
    setPicker(null);setQArt('');
  }

  var maxDesc=getMaxDesc(user.id,user);

  function confirmarPrep(){
    var ped=prepModal;
    var faltaMotivo=prepItems.find(function(it){
      var cambioCantidad=(it.tipo!=='agregado'&&Math.abs((parseFloat(it.cantFinal)||0)-(parseFloat(it.cant)||0))>0.0001);
      var requiereMotivo=(it.tipo!=='original')||cambioCantidad;
      return requiereMotivo&&!String(it.motivo||'').trim();
    });
    if(faltaMotivo){flash('err','Completá el motivo en cada artículo agregado, reemplazado o modificado en cantidad.');return;}
    var cleanItems=prepItems.map(function(it){
      var fixed=normalizePedidoItemPrecio(it,catalogo);
      var pu=Math.max(parseFloat(fixed.costo)||0,parseFloat(fixed.pu)||0);
      var base=Object.assign({},fixed,{pu:pu});
      var d=Math.min(maxLineDescByCost(base,maxDesc),Math.max(0,parseFloat(it.descPct)||0));
      return Object.assign({},base,{descPct:d});
    });
    var newSub=subtotalItemsConDesc(cleanItems);
    var costoTotal=totalCostoItems(cleanItems);
    var maxGeneral=maxGeneralDescByCost(newSub,costoTotal,maxDesc);
    var descGeneral=Math.min(maxGeneral,Math.max(0,parseFloat(prepDescPct)||0));
    if((parseFloat(prepDescPct)||0)>maxGeneral+0.0001){flash('err','El descuento general supera el margen de costo. Máximo permitido: '+maxGeneral.toFixed(2)+'%.');return;}
    var recalculado=recalcularPedidoPorItemsFinales(ped,cleanItems,descGeneral);
    if(recalculado.total+0.01<costoTotal){flash('err','No se puede guardar: el total queda por debajo del costo.');return;}
    var updPed=Object.assign({},recalculado,{
      estado:'listo_entrega',
      preparadorId:user.id,preparadorNombre:user.nombre||user.username,
      fechaPreparado:nowStr(),
      notaPrep:notaPrep.trim()||null
    });
    dbUpdate('pedidos',updPed.id,pedToDb(updPed))
      .then(function(){reload();setPrepModal(null);flash('ok','Pedido #'+ped.nPedido+' preparado y enviado a Pendiente para entregar.');})
      .catch(function(e){flash('err','Error al guardar: '+e.message);});
  }

  // ─── PASO 2: APROBAR → BOLETA ────────────────────────────
  function aprobarEntrega(ped){
    var updPed=Object.assign({},ped,{estado:'listo_entrega'});
    dbUpdate('pedidos',updPed.id,pedToDb(updPed))
      .then(function(){reload();setBoletaModal(updPed);flash('ok','Boleta generada. El pedido está listo para entrega.');})
      .catch(function(e){flash('err','Error: '+e.message);});
  }

  // ─── PASO 3: ENTREGADO + RENDICIÓN ───────────────────────
  function abrirRendicion(ped){
    setRendModal(ped);setRendStep(1);setHasDev(null);
    setDevItems((ped.itemsFinales||ped.items||[]).filter(function(it){
      var c=it.cantFinal!==undefined?it.cantFinal:it.cant;return c>0;
    }).map(function(it){
      var c=it.cantFinal!==undefined?it.cantFinal:it.cant;
      return Object.assign({},it,{cantDev:0,motivoDev:'',devuelto:false,cantEnviada:c});
    }));
    setRendForm({efectivo:0,transferencia:0,datosTrans:'',cuentaCorriente:0,obs:''});
  }

  function setDI(idx,k,v){
    setDevItems(function(prev){
      var u=prev.slice();u[idx]=Object.assign({},u[idx]);
      if(k==='devuelto'){u[idx].devuelto=v;if(!v){u[idx].cantDev=0;u[idx].motivoDev='';}}
      else if(k==='cantDev')u[idx].cantDev=Math.min(u[idx].cantEnviada,normalizarCantidad(v,itemEsPesable(u[idx]),0));
      else u[idx][k]=v;
      return u;
    });
  }

  function confirmarRendicion(){
    var ped=rendModal;
    if(hasDev===null){flash('err','Indicá si hubo devoluciones.');return;}
    if(hasDev){
      var sinMotivo=(devItems.filter(function(d){return d.devuelto;})).find(function(d){return !d.motivoDev;});
      if(sinMotivo){flash('err','Completá el motivo de cada artículo devuelto.');return;}
    }
    var devFinal=hasDev?devItems.filter(function(d){return d.devuelto&&d.cantDev>0;}):[];
    var montoDev=devFinal.reduce(function(s,d){return s+d.cantDev*(d.pu||0);},0);
    var totalARendir=ped.total-montoDev;
    var ef=parseFloat(rendForm.efectivo)||0;
    var tr=parseFloat(rendForm.transferencia)||0;
    var cc=parseFloat(rendForm.cuentaCorriente)||0;
    var totalRendido=ef+tr+cc;

    function guardar(deudaActual){
      var rendicion={efectivo:ef,transferencia:tr,datosTrans:rendForm.datosTrans,
        cuentaCorriente:cc,totalARendir:totalARendir,totalRendido:totalRendido,
        diferencia:totalRendido-totalARendir,observaciones:rendForm.obs,
        fecha:nowStr(),preparadorId:user.id,preparadorNombre:user.nombre||user.username,
        resumen:'Entregado el '+nowStr()+'. Pago: '+([ef>0?'Efectivo $'+$(ef):'',tr>0?'Transferencia $'+$(tr):'',cc>0?'Cuenta corriente $'+$(cc):''].filter(Boolean).join(' + ')||'Sin pago registrado')};
      var formaPago=[];
      if(ef>0)formaPago.push('Efectivo');
      if(tr>0)formaPago.push('Transferencia');
      if(cc>0)formaPago.push('Cuenta Corriente');
      var updPed=Object.assign({},ped,{
        estado:'entregado',fechaEntregado:nowStr(),
        devoluciones:devFinal,rendicion:rendicion,
        formaPago:formaPago.join(' + ')||'Sin especificar',montoPago:totalRendido
      });
      var p=dbUpdate('pedidos',updPed.id,pedToDb(updPed));
      if(cc>0&&deudaActual!==undefined){
        p=p.then(function(){
          return registrarMovCC(ped.cliente.id,ped.cliente.nombre+' '+ped.cliente.apellido,
            'debito',cc,deudaActual,{userId:user.id,userName:user.nombre||user.username,
            pedidoId:ped.id,formaPago:'cuenta_corriente'});
        });
      }
      p.then(function(){reload();setRendModal(null);flash('ok','Pedido #'+ped.nPedido+' marcado como ENTREGADO y guardado en el histórico con resumen de cobro.');})
       .catch(function(e){flash('err','Error al cerrar pedido: '+e.message);});
    }

    if(cc>0){
      dbGetOne('clientes',ped.cliente.id).then(function(c){
        if(c&&c.tipo_cc==='Con Tope'&&(parseFloat(c.deuda||0)+cc)>parseFloat(c.lim_cc||0)){
          flash('err','⚠️ Supera el tope de CC. Disponible: $'+$(parseFloat(c.lim_cc||0)-parseFloat(c.deuda||0)));return;
        }
        guardar(parseFloat(c&&c.deuda||0));
      });
    } else {guardar();}
  }

  // ─── FILTROS ─────────────────────────────────────────────
  var pendientes=pedidos.filter(function(p){return p.estado==='pendiente';}).sort(function(a,b){return a.nPedido-b.nPedido;});
  var preparados=pedidos.filter(function(p){return p.estado==='preparado';}).sort(function(a,b){return a.nPedido-b.nPedido;});
  var listos=pedidos.filter(function(p){return p.estado==='listo_entrega';}).sort(function(a,b){return a.nPedido-b.nPedido;});
  var enTransito=pedidos.filter(function(p){return p.estado==='en_transito';}).sort(function(a,b){return a.nPedido-b.nPedido;});
  var filtCat=catalogo.filter(function(a){
    if(!qArt||!qArt.trim())return true;
    var palabras=normTxt(qArt).split(/\s+/).filter(Boolean);
    var haystack=normTxt([a.cod,a.codArt,a.desc].join(' '));
    return palabras.every(function(p){return haystack.indexOf(p)>=0;});
  });
  var prepSubCalc=subtotalItemsConDesc(prepItems);
  var prepCostoCalc=totalCostoItems(prepItems);
  var prepMaxGeneralDesc=maxGeneralDescByCost(prepSubCalc,prepCostoCalc,maxDesc);
  var prepDescCalc=Math.min(prepMaxGeneralDesc,Math.max(0,parseFloat(prepDescPct)||0));
  var prepTotalCalc=prepSubCalc*(1-prepDescCalc/100);

  // Rendición calc
  var devFinalCalc=hasDev?devItems.filter(function(d){return d.devuelto&&d.cantDev>0;}):[];
  var montoDevCalc=devFinalCalc.reduce(function(s,d){return s+d.cantDev*(d.pu||0);},0);
  var totalARendirCalc=rendModal?(rendModal.total-montoDevCalc):0;
  var totalRendidoCalc=(parseFloat(rendForm.efectivo)||0)+(parseFloat(rendForm.transferencia)||0)+(parseFloat(rendForm.cuentaCorriente)||0);
  var difCalc=totalRendidoCalc-totalARendirCalc;

  function pedRow(p,btns){
    return E('tr',{key:p.id},
      E('td',null,E('strong',null,'#'+p.nPedido)),
      E('td',null,p.fecha?(horaSolo(p.fecha)):'—'),
      E('td',null,p.preventistaNombre),
      E('td',null,E('div',null,p.cliente.nombreFantasia||p.cliente.nombre+' '+p.cliente.apellido),E('div',{style:{fontSize:10,color:'var(--txt2)'}},p.cliente.dir)),
      E('td',null,'$'+$(p.total)),
      E('td',null,E('div',{className:'brow'},btns))
    );
  }
  var th=E('thead',null,E('tr',null,
    E('th',null,'N°'),E('th',null,'Hora'),E('th',null,'Preventista'),E('th',null,'Cliente'),E('th',null,'Total'),E('th',null,'')
  ));

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'alert warn'},
      E('span',null,isAdminPrep?'🔐 Admin/Co-Admin: podés preparar pedidos y aplicar descuentos controlados.':'👷 Preparador: podés ver pedidos, agregar/reemplazar artículos con motivo, ajustar cantidades, marcar listo para entregar y cerrar la entrega. No podés tocar descuentos.')
    ),

    /* ══ PASO 1 ══ */
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('span',{style:{width:10,height:10,borderRadius:'50%',background:'var(--orange)',display:'inline-block',marginRight:8}}),
        E('div',{className:'card-title'},isAdminPrep?'Paso 1 — Por Preparar / Descuentos ('+pendientes.length+')':'Paso 1 — Por Preparar ('+pendientes.length+')')
      ),
      pendientes.length===0
        ? E('div',{className:'empty',style:{padding:20}},
            'Sin pedidos pendientes.',E('br'),
            E('small',{style:{color:'var(--txt2)'}},'Cuando el preventista envíe un pedido, aparecerá acá.')
          )
        : E('div',{className:'tw'},E('table',null,th,
            E('tbody',null,pendientes.map(function(p){
              return pedRow(p,[E('button',{className:'btn sm pri',onClick:function(){abrirPrep(p);}},'⚙️ Preparar / Ajustar')]);
            }))
          ))
    ),

    /* ══ PASO 2 ══ */
    preparados.length>0&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('span',{style:{width:10,height:10,borderRadius:'50%',background:'var(--blue)',display:'inline-block',marginRight:8}}),
        E('div',{className:'card-title'},'Paso 2 — Aprobar y Generar Boleta (',preparados.length,')')
      ),
      E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:10}},'Revisá que el pedido esté listo físicamente y aprobalo para generar la boleta PDF.'),
      E('div',{className:'tw'},E('table',null,th,
        E('tbody',null,preparados.map(function(p){
          return pedRow(p,[E('button',{className:'btn sm ok',onClick:function(){aprobarEntrega(p);}},'✅ Aprobar y Generar Boleta')]);
        }))
      ))
    ),

    /* ══ PASO 3 ══ */
    (listos.length>0||enTransito.length>0)&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('span',{style:{width:10,height:10,borderRadius:'50%',background:'var(--purple)',display:'inline-block',marginRight:8}}),
        E('div',{className:'card-title'},'Pendientes para entregar / Cerrar venta (',listos.length+enTransito.length,')')
      ),
      E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:10}},'Zona transitoria: el pedido ya está preparado. El preparador puede marcar ENTREGADO, registrar devoluciones/rechazos y cerrar el cobro.'),
      E('div',{className:'tw'},E('table',null,th,
        E('tbody',null,listos.concat(enTransito).sort(function(a,b){return a.nPedido-b.nPedido;}).map(function(p){
          return pedRow(p,[
            E('button',{className:'btn sm',onClick:function(){setBoletaModal(p);}},'🧾 Boleta'),
            isPreparador&&E('button',{className:'btn sm teal',onClick:function(){abrirRendicion(p);}},'✅ ENTREGADO / Cerrar venta')
          ].filter(Boolean));
        }))
      ))
    ),

    /* ══ MODAL PREPARAR ══ */
    prepModal&&E(Modal,{title:'Preparar Pedido #'+prepModal.nPedido,onClose:function(){setPrepModal(null);},xl:true},
      E('div',{style:{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}},
        E('div',null,'Cliente: ',E('strong',null,prepModal.cliente.nombreFantasia||prepModal.cliente.nombre+' '+prepModal.cliente.apellido)),
        E('div',null,'Preventista: ',prepModal.preventistaNombre),
        prepModal.nota&&E('div',{style:{color:'var(--orange)'}},E('strong',null,'Nota: '),prepModal.nota)
      ),
      E('div',{style:{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}},
        E('button',{className:'btn ok sm',onClick:function(){
          setPrepItems(function(prev){return prev.map(function(it){return Object.assign({},it,{cantFinal:it.tipo==='agregado'?it.cantFinal:it.cant,motivo:''});});});
        }},'✓ Confirmar todo sin cambios'),
        E('button',{className:'btn sm pri',onClick:function(){setPicker(picker==='add'?null:'add');setQArt('');}},
          picker==='add'?'✕ Cerrar':'+ Agregar artículo')
      ),

      isAdminPrep&&E('div',{style:{background:'#f8fafc',border:'1.5px solid var(--border)',borderRadius:8,padding:12,marginBottom:12}},
        E('div',{style:{fontWeight:700,color:'var(--blue)',marginBottom:8}},'💸 Descuentos del pedido'),
        E('div',{className:'grid2'},
          E('div',{className:'fg'},
            E('label',null,'Descuento general del pedido (%)'),
            E('input',{className:'fi',type:'number',min:0,max:prepMaxGeneralDesc,step:0.5,value:prepDescPct,
              onChange:function(e){setPrepDescPct(Math.min(prepMaxGeneralDesc,Math.max(0,parseFloat(e.target.value)||0)));}}),
            E('div',{style:{fontSize:11,color:'var(--txt2)',marginTop:4}},'Máximo permitido: '+prepMaxGeneralDesc.toFixed(2)+'%. No permite vender por debajo del costo.')
          ),
          E('div',{className:'fg'},
            E('label',null,'Total recalculado'),
            E('div',{style:{padding:'12px',border:'1.5px solid #b8cef0',borderRadius:8,background:'#eef3fb',fontWeight:800,color:'var(--blue)',fontSize:16}},
              '$'+$(prepTotalCalc))
          )
        ),
        E('div',{style:{fontSize:12,color:'var(--txt2)'}},'También podés cambiar el precio unitario o el descuento de cada artículo. El sistema bloquea descuentos mayores al 10% o que dejen el pedido por debajo del costo.')
      ),

      /* Picker agregar */
      picker==='add'&&E('div',{style:{background:'#f0f4fb',border:'1.5px solid #b8cef0',borderRadius:8,padding:12,marginBottom:12}},
        E('div',{style:{fontWeight:700,fontSize:12,marginBottom:8}},'Seleccioná artículo a agregar:'),
        E('input',{className:'fi',placeholder:'Buscar…',value:qArt,onChange:function(e){setQArt(e.target.value);},style:{marginBottom:8}}),
        E('div',{className:'art-grid'},filtCat.slice(0,50).map(function(a){
          return E('button',{key:a.id,className:'art-btn',onClick:function(){agregarArt(a);}},
            E('div',{className:'ab-code'},a.cod),E('div',{className:'ab-name'},a.desc),E('div',{className:'ab-price'},'$'+$(artPrecioPublicoUnit(a))));
        }))
      ),

      /* Picker reemplazar */
      typeof picker==='number'&&E('div',{style:{background:'#fff7ed',border:'1.5px solid #fed7aa',borderRadius:8,padding:12,marginBottom:12}},
        E('div',{style:{fontWeight:700,fontSize:12,color:'var(--orange)',marginBottom:6}},
          'Reemplazar "'+prepItems[picker].desc+'" con:'),
        E('input',{className:'fi',placeholder:'Buscar reemplazo…',value:qArt,onChange:function(e){setQArt(e.target.value);},style:{marginBottom:8}}),
        E('div',{className:'art-grid'},filtCat.filter(function(a){return a.id!==prepItems[picker].artId;}).slice(0,50).map(function(a){
          return E('button',{key:a.id,className:'art-btn',onClick:function(){reemplazar(picker,a);}},
            E('div',{className:'ab-code'},a.cod),E('div',{className:'ab-name'},a.desc),E('div',{className:'ab-price'},'$'+$(artPrecioPublicoUnit(a))));
        })),
        E('button',{className:'btn sm',style:{marginTop:8},onClick:function(){setPicker(null);setQArt('');}}, '✕ Cancelar')
      ),

      /* Tabla items */
      E('div',{className:'tw',style:{marginBottom:12}},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'Tipo'),E('th',null,'Artículo'),E('th',null,'Pedido'),
          E('th',null,'A enviar'),E('th',null,'P.Unit'),
          (user.role==='admin'||user.role==='coadmin')&&E('th',null,'Desc.%'),
          E('th',null,'Subtotal'),E('th',null,'Motivo'),E('th',null,'')
        )),
        E('tbody',null,prepItems.map(function(it,i){
          var isAdminPrep=user.role==='admin'||user.role==='coadmin';
          var changed=it.tipo!=='original'||(it.cantFinal!==it.cant);
          var bg=it.tipo==='reemplazo'?'#fff7ed':it.tipo==='agregado'?'#f0fdf4':it.cantFinal===0?'#fff0f0':changed?'#fffbeb':'';
          var badge=it.tipo==='reemplazo'?{b:'#fed7aa',t:'#92400e',l:'Reemplazo'}:it.tipo==='agregado'?{b:'#bbf7d0',t:'#166534',l:'Agregado'}:{b:'#e2e8f0',t:'#374151',l:'Original'};
          var lineDesc=it.descPct||0;
          var lineSub=(it.cantFinal||0)*it.pu*(1-lineDesc/100);
          return E('tr',{key:i,style:{background:bg}},
            E('td',null,E('span',{style:{padding:'2px 7px',borderRadius:10,fontSize:10,fontWeight:700,background:badge.b,color:badge.t}},badge.l)),
            E('td',null,E('div',{style:{fontWeight:600,fontSize:13}},it.desc),it.ofertaAplicada&&E('div',{className:'offer-applied-badge'},'🔥 Oferta Relámpago aplicada'),E('div',{style:{fontSize:10,color:'var(--txt2)'}},it.cod)),
            E('td',null,it.tipo==='agregado'?'—':it.cant),
            E('td',null,
              E('input',{type:'number',inputMode:'decimal',min:0,max:it.tipo==='agregado'?999:it.cant,step:qtyStep(it),value:it.cantFinal,
              onChange:function(e){setIF(i,'cantFinal',e.target.value);},
              style:{width:72,padding:'5px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontFamily:'inherit',
                background:it.cantFinal===0?'#fee2e2':changed?'#fef9c3':''}}),
              E('div',{style:{fontSize:10,color:itemEsPesable(it)?'var(--green)':'var(--txt2)',fontWeight:itemEsPesable(it)?700:400}},itemEsPesable(it)?'kg':'un.'),
              itemPermiteKg(it)
                ? E('button',{type:'button',className:'btn sm',style:{marginTop:4,fontSize:10,padding:'3px 6px'},onClick:function(){setIF(i,'pesable',!itemEsPesable(it));}},itemEsPesable(it)?'Unidad':'Kg')
                : E('div',{style:{fontSize:10,color:'var(--txt2)',marginTop:4}},'No pesable')
            ),
            E('td',null,
              isAdminPrep
                ? E('input',{type:'number',min:0,step:0.01,value:it.pu,
                    onChange:function(e){setIF(i,'pu',e.target.value);},
                    style:{width:80,padding:'5px 8px',border:'1.5px solid #b8cef0',borderRadius:6,fontFamily:'inherit',background:'#eef3fb'}})
                : '$'+$(it.pu)
            ),
            isAdminPrep&&E('td',null,
              E('input',{type:'number',min:0,max:maxLineDescByCost(it,maxDesc),step:0.5,value:lineDesc,
                onChange:function(e){setIF(i,'descPct',Math.min(maxLineDescByCost(it,maxDesc),Math.max(0,parseFloat(e.target.value)||0)));},
                style:{width:60,padding:'5px 8px',border:'1.5px solid '+(lineDesc>0?'#fed7aa':'var(--border)'),
                  borderRadius:6,fontFamily:'inherit',background:lineDesc>0?'#fffbeb':''}})
            ),
            E('td',null,E('span',{style:{fontWeight:700,color:lineDesc>0?'var(--green)':'inherit'}},'$'+$(lineSub))),
            E('td',null,(changed||it.tipo!=='original')&&E('input',{
              value:it.motivo||'',onChange:function(e){setIF(i,'motivo',e.target.value);},
              placeholder:'Motivo…',
              style:{padding:'4px 6px',border:'1.5px solid var(--border)',borderRadius:5,fontFamily:'inherit',fontSize:12,minWidth:90,width:'100%'}})),
            E('td',null,
              it.tipo==='original'&&it.cantFinal>0&&typeof picker!=='number'&&
                E('button',{className:'btn sm warn',style:{fontSize:11},onClick:function(){setPicker(i);setQArt('');}}, '🔄'),
              (it.tipo!=='original')&&E('button',{className:'btn sm dan',style:{fontSize:11},
                onClick:function(){setPrepItems(function(prev){return prev.filter(function(_,j){return j!==i;});});}}, '✕')
            )
          );
        }))
      )),
      E('div',{className:'fg'},E('label',null,'Nota para el preventista (opcional)'),
        E('input',{className:'fi',placeholder:'Ej: Faltó azúcar, se mandó reemplazo…',value:notaPrep,onChange:function(e){setNotaPrep(e.target.value);}})),
      E('div',{style:{textAlign:'right',fontWeight:700,fontSize:14,color:'var(--blue)',marginBottom:14}},
        E('div',null,'Total pedido original: $'+$(totalOriginalPedido(prepModal))),
        E('div',null,'Subtotal preparado: $'+$(prepSubCalc), prepDescCalc>0?' · Desc. general '+prepDescCalc+'%':'', ' · Total preparado final: $'+$(prepTotalCalc)),
        E('div',{style:{fontSize:12,color:(prepTotalCalc<totalOriginalPedido(prepModal)?'var(--orange)':'var(--green)')}},
          'Diferencia por unidades descontadas/agregadas: $'+$(prepTotalCalc-totalOriginalPedido(prepModal)))
      ),
      E('div',{className:'brow'},
        E('button',{className:'btn ok',style:{flex:1},onClick:confirmarPrep},'✅ Marcar listo para entregar'),
        E('button',{className:'btn',style:{flex:1},onClick:function(){setPrepModal(null);}},'Cancelar')
      )
    ),

    /* ══ MODAL RENDICIÓN ══ */
    rendModal&&rendStep===1&&E(Modal,{title:'Entregado / Devoluciones — Pedido #'+rendModal.nPedido,onClose:function(){setRendModal(null);},wide:true},
      E('div',{style:{background:'#eef3fb',borderRadius:8,padding:'10px 14px',marginBottom:14}},
        E('div',null,'Cliente: ',E('strong',null,rendModal.cliente.nombreFantasia||rendModal.cliente.nombre+' '+rendModal.cliente.apellido)),
        E('div',null,'Total: ',E('strong',{style:{color:'var(--blue)'}},'$'+$(rendModal.total)))
      ),
      E('div',{style:{fontWeight:700,marginBottom:10}},'¿Hubo artículos devueltos?'),
      E('div',{className:'brow',style:{marginBottom:14}},
        E('button',{className:'btn '+(hasDev===false?'ok':''),style:{flex:1},onClick:function(){setHasDev(false);}},'No, todo entregado'),
        E('button',{className:'btn '+(hasDev===true?'warn':''),style:{flex:1},onClick:function(){setHasDev(true);}},'Sí, hubo devoluciones')
      ),
      hasDev&&E('div',null,
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,
            E('th',null,'Dev.'),E('th',null,'Artículo'),E('th',null,'Cant. enviada'),E('th',null,'Cant. devuelta'),E('th',null,'Motivo')
          )),
          E('tbody',null,devItems.map(function(it,i){
            return E('tr',{key:i,style:{background:it.devuelto?'#fffbeb':''}},
              E('td',null,E('input',{type:'checkbox',checked:!!it.devuelto,onChange:function(e){setDI(i,'devuelto',e.target.checked);},style:{width:18,height:18}})),
              E('td',null,it.desc),
              E('td',null,it.cantEnviada),
              E('td',null,it.devuelto&&E('input',{type:'number',min:itemEsPesable(it)?0.001:1,max:it.cantEnviada,step:qtyStep(it),value:it.cantDev||1,
                onChange:function(e){setDI(i,'cantDev',e.target.value);},
                style:{width:60,padding:'4px 6px',border:'1.5px solid var(--border)',borderRadius:5,fontFamily:'inherit'}})),
              E('td',null,it.devuelto&&E('select',{
                value:it.motivoDev||'',onChange:function(e){setDI(i,'motivoDev',e.target.value);},
                style:{padding:'4px 6px',border:'1.5px solid var(--border)',borderRadius:5,fontFamily:'inherit',fontSize:12}},
                E('option',{value:''},'— Motivo —'),
                E('option',{value:'No lo quiso'},'No lo quiso'),
                E('option',{value:'Artículo dañado'},'Artículo dañado'),
                E('option',{value:'Error en pedido'},'Error en pedido'),
                E('option',{value:'No pudo pagar'},'No pudo pagar'),
                E('option',{value:'Otro'},'Otro')
              ))
            );
          }))
        ))
      ),
      E('div',{className:'brow',style:{marginTop:16}},
        E('button',{className:'btn teal',style:{flex:1},onClick:function(){setRendStep(2);}},
          'Continuar al cobro →'),
        E('button',{className:'btn',style:{flex:1},onClick:function(){setRendModal(null);}},'Cancelar')
      )
    ),

    rendModal&&rendStep===2&&E(Modal,{title:'Formas de pago — Cerrar venta #'+rendModal.nPedido,onClose:function(){setRendModal(null);},wide:true},
      E('div',{style:{background:'#eef3fb',borderRadius:8,padding:'12px 14px',marginBottom:14}},
        E('div',{className:'trow'},E('span',null,'Total pedido:'),E('strong',null,'$'+$(rendModal.total))),
        devFinalCalc.length>0&&E('div',{className:'trow'},
          E('span',null,'Devoluciones:'),
          E('span',{style:{color:'var(--orange)',fontWeight:700}},'-$'+$(montoDevCalc))),
        E('div',{className:'trow big'},E('span',null,'TOTAL A COBRAR:'),E('strong',null,'$'+$(totalARendirCalc)))
      ),
      E('div',{style:{fontWeight:700,fontSize:13,marginBottom:12}},'Forma de cobro (podés combinar):'),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Efectivo ($)'),
          E('input',{className:'fi',type:'number',min:0,value:rendForm.efectivo,onChange:function(e){RF('efectivo',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Transferencia ($)'),
          E('input',{className:'fi',type:'number',min:0,value:rendForm.transferencia,onChange:function(e){RF('transferencia',e.target.value);}}))
      ),
      rendForm.transferencia>0&&E('div',{className:'fg'},E('label',null,'Datos transferencia'),
        E('input',{className:'fi',placeholder:'Banco, N° comprobante…',value:rendForm.datosTrans,onChange:function(e){RF('datosTrans',e.target.value);}})),
      E('div',{className:'fg'},E('label',null,'Cuenta Corriente / Fiado ($)'),
        E('input',{className:'fi',type:'number',min:0,value:rendForm.cuentaCorriente,onChange:function(e){RF('cuentaCorriente',e.target.value);}})),
      totalRendidoCalc>0&&E('div',{style:{background:Math.abs(difCalc)<1?'#f0fdf4':'#fffbeb',borderRadius:8,padding:'10px 14px',marginBottom:12}},
        E('div',{className:'trow'},E('span',null,'Total cobrado:'),E('strong',null,'$'+$(totalRendidoCalc))),
        E('div',{className:'trow'},E('span',null,'Diferencia:'),
          E('strong',{style:{color:Math.abs(difCalc)<1?'var(--green)':difCalc>0?'var(--blue)':'var(--red)'}},
            difCalc>=0?'$'+$(difCalc)+' sobrante':'-$'+$(Math.abs(difCalc))+' faltante'))
      ),
      E('div',{className:'fg'},E('label',null,'Observaciones (opcional)'),
        E('textarea',{className:'fi',rows:2,value:rendForm.obs,onChange:function(e){RF('obs',e.target.value);},style:{resize:'vertical'}})),
      E('div',{className:'brow',style:{marginTop:16}},
        E('button',{className:'btn',onClick:function(){setRendStep(1);}},'← Volver'),
        E('button',{className:'btn ok',style:{flex:1},onClick:confirmarRendicion},'✅ Marcar ENTREGADO y guardar cobro')
      )
    ),

    boletaModal&&E(BoletaModal,{ped:boletaModal,onClose:function(){setBoletaModal(null);}})
  );
}



/* ═══════════════════════════
   MODAL DESCUENTOS ADMIN / COADMIN
═══════════════════════════ */
function PedidoDescuentoModal(props){
  var ped=props.ped;
  var user=props.user||getAdmin();
  var maxDesc=getMaxDesc(user.id,user);
  var srcItems=(ped.itemsFinales&&ped.itemsFinales.length?ped.itemsFinales:ped.items)||[];
  var _cat=useState([]),catalogo=_cat[0],setCatalogo=_cat[1];
  var _it=useState(srcItems.map(function(it){
    var cant=it.cantFinal!==undefined?it.cantFinal:it.cant;
    return normalizePedidoItemPrecio(Object.assign({},it,{cantFinal:cant,descPct:parseFloat(it.descPct)||0}),[]);
  })),items=_it[0],setItems=_it[1];
  useEffect(function(){
    dbGet('articulos').then(function(rows){
      var cats=(rows||[]).map(dbToArt);
      setCatalogo(cats);
      setItems(function(prev){return prev.map(function(it){return normalizePedidoItemPrecio(it,cats);});});
    });
  },[]);
  var _d=useState(parseFloat(ped.descPct)||0),descGeneral=_d[0],setDescGeneral=_d[1];
  var _m=useState(null),msg=_m[0],setMsg=_m[1];
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4000);}
  function setItem(idx,k,v){
    setItems(function(prev){
      var u=prev.slice();u[idx]=Object.assign({},u[idx]);
      if(k==='pu')u[idx].pu=Math.max(parseFloat(u[idx].costo)||0,parseFloat(v)||0);
      else if(k==='descPct'){var cap=maxLineDescByCost(u[idx],maxDesc);u[idx].descPct=Math.min(cap,Math.max(0,parseFloat(v)||0));}
      return u;
    });
  }
  var subCalc=subtotalItemsConDesc(items);
  var costoCalc=totalCostoItems(items);
  var maxGeneral=maxGeneralDescByCost(subCalc,costoCalc,maxDesc);
  var descCalc=Math.min(maxGeneral,Math.max(0,parseFloat(descGeneral)||0));
  var totalCalc=subCalc*(1-descCalc/100);
  function guardar(){
    if((parseFloat(descGeneral)||0)>maxGeneral+0.0001){flash('err','El descuento general supera el margen de costo. Máximo permitido: '+maxGeneral.toFixed(2)+'%.');return;}
    if(totalCalc+0.01<costoCalc){flash('err','No se puede guardar: el total queda por debajo del costo.');return;}
    var clean=items.map(function(it){
      var fixed=normalizePedidoItemPrecio(it,catalogo);
      var pu=Math.max(parseFloat(fixed.costo)||0,parseFloat(fixed.pu)||0);
      var base=Object.assign({},fixed,{pu:pu});
      var d=Math.min(maxLineDescByCost(base,maxDesc),Math.max(0,parseFloat(it.descPct)||0));
      return Object.assign({},base,{descPct:d});
    });
    var upd=Object.assign({},ped,{sub:subCalc,descPct:descCalc,descAmt:subCalc*(descCalc/100),total:totalCalc});
    if(ped.estado==='pendiente'){
      upd.items=clean.map(function(it){var x=Object.assign({},it);delete x.cantFinal;return x;});
      upd.itemsFinales=null;
    }else{
      upd.itemsFinales=clean;
    }
    dbUpsert('pedidos',pedToDb(upd)).then(function(){props.onSaved&&props.onSaved(upd);}).catch(function(e){flash('err','Error al guardar descuentos: '+e.message);});
  }
  return E(Modal,{title:'Aplicar descuentos — Pedido #'+ped.nPedido,onClose:props.onClose,wide:true},
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'alert warn'},E('span',null,
      'Límite del usuario: ',E('strong',null,maxDesc+'%'),'. El sistema no permite que el total quede por debajo del costo.'
    )),
    E('div',{style:{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
      E('div',null,'Cliente: ',E('strong',null,ped.cliente.nombreFantasia||ped.cliente.nombre+' '+ped.cliente.apellido)),
      E('div',null,'Preventista: ',E('strong',null,ped.preventistaNombre)),
      E('div',null,'Costo total: ',E('strong',null,'$'+$(costoCalc))),
      E('div',null,'Máx. descuento general: ',E('strong',null,maxGeneral.toFixed(2)+'%'))
    ),
    E('div',{className:'tw'},E('table',null,
      E('thead',null,E('tr',null,
        E('th',null,'Artículo'),E('th',null,'Cant.'),E('th',null,'Costo'),E('th',null,'P.Unit.'),E('th',null,'Desc.%'),E('th',null,'Subtotal')
      )),
      E('tbody',null,items.map(function(it,i){
        var cant=itemQtyFinal(it);
        var cap=maxLineDescByCost(it,maxDesc);
        var d=Math.min(cap,Math.max(0,parseFloat(it.descPct)||0));
        var sub=cant*itemPrecioUnit(it)*(1-d/100);
        return E('tr',{key:i},
          E('td',null,E('div',{style:{fontWeight:600}},it.desc),E('div',{style:{fontSize:10,color:'var(--txt2)'}},it.cod)),
          E('td',null,cant),
          E('td',null,'$'+$(it.costo||0)),
          E('td',null,E('input',{type:'number',min:it.costo||0,step:0.01,value:it.pu,
            onChange:function(e){setItem(i,'pu',e.target.value);},
            style:{width:95,padding:'5px 8px',border:'1.5px solid #b8cef0',borderRadius:6,fontFamily:'inherit',background:'#eef3fb'}})),
          E('td',null,E('input',{type:'number',min:0,max:cap,step:0.5,value:d,
            onChange:function(e){setItem(i,'descPct',e.target.value);},
            style:{width:70,padding:'5px 8px',border:'1.5px solid '+(d>0?'#fed7aa':'var(--border)'),borderRadius:6,fontFamily:'inherit',background:d>0?'#fffbeb':''}}),
            E('div',{style:{fontSize:10,color:'var(--txt2)'}},'máx '+cap.toFixed(2)+'%')),
          E('td',null,E('strong',{style:{color:d>0?'var(--green)':'inherit'}},'$'+$(sub)))
        );
      }))
    )),
    E('div',{className:'totals',style:{marginTop:12,maxWidth:360,marginLeft:'auto'}},
      E('div',{className:'trow'},E('span',null,'Subtotal'),E('strong',null,'$'+$(subCalc))),
      E('div',{className:'fg',style:{marginTop:8}},
        E('label',null,'Descuento general (%)'),
        E('input',{className:'fi',type:'number',min:0,max:maxGeneral,step:0.5,value:descGeneral,
          onChange:function(e){setDescGeneral(Math.min(maxGeneral,Math.max(0,parseFloat(e.target.value)||0)));}}),
        E('div',{style:{fontSize:11,color:'var(--txt2)',marginTop:4}},'Máx. permitido: '+maxGeneral.toFixed(2)+'%')
      ),
      descCalc>0&&E('div',{className:'trow'},E('span',null,'Descuento'),E('strong',{style:{color:'var(--red)'}},'−$'+$(subCalc*(descCalc/100)))),
      E('div',{className:'trow big'},E('span',null,'TOTAL'),E('span',null,'$'+$(totalCalc)))
    ),
    E('div',{className:'brow',style:{marginTop:16,justifyContent:'flex-end'}},
      E('button',{className:'btn ok',onClick:guardar},'💾 Guardar descuentos'),
      E('button',{className:'btn',onClick:props.onClose},'Cancelar')
    )
  );
}

function TodosPedidos(props){
  var user=(props&&props.user)||getAdmin();
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isPreparador=user.role==='preparador';
  var _a=useState([]),pedidos=_a[0],setPedidos=_a[1];
  var _b=useState(''),q=_b[0],setQ=_b[1];
  var _c=useState(''),filtEstado=_c[0],setFiltEstado=_c[1];
  var _d=useState(''),filtPrev=_d[0],setFiltPrev=_d[1];
  var _e=useState(null),detalle=_e[0],setDetalle=_e[1];
  var _can=useState(null),cancelPed=_can[0],setCancelPed=_can[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];
  var _bm=useState(null),boletaModal=_bm[0],setBoletaModal=_bm[1];
  var _dm=useState(null),descuentoModal=_dm[0],setDescuentoModal=_dm[1];
  var _bulk=useState(false),bulkDeleteOpen=_bulk[0],setBulkDeleteOpen=_bulk[1];
  var _bh=useState(''),bulkHasta=_bh[0],setBulkHasta=_bh[1];
  var _bc=useState(''),bulkCode=_bc[0],setBulkCode=_bc[1];
  var _sd=useState(toInputDateLocal(new Date())),stockDesde=_sd[0],setStockDesde=_sd[1];
  var _sh=useState(toInputDateLocal(new Date())),stockHasta=_sh[0],setStockHasta=_sh[1];
  var _sr=useState(null),stockReport=_sr[0],setStockReport=_sr[1];

  function reloadPeds(){dbGet('pedidos').then(function(rows){if(rows)setPedidos(rows.map(dbToPed));});}
  useEffect(function(){reloadPeds();var iv=setInterval(reloadPeds,8000);return function(){clearInterval(iv);};},[]);
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4000);}
  function irATrabajarPedido(p){
    if(props&&props.setMod){props.setMod('cola-prep');return;}
    flash('warn','Entrá al módulo Preparación para trabajar este pedido.');
  }

  var adminUser={role:'admin',nombre:'Administrador',username:'ADMINISTRADOR'};

  function handleCancelar(motivo){
    var ped=cancelPed;
    var updPed=Object.assign({},ped,{
      estado:'cancelado',
      canceladoPor:'Administrador',
      canceladoFecha:nowStr(),
      canceladoMotivo:motivo
    });
    dbUpdate('pedidos',updPed.id,pedToDb(updPed)).then(function(){
      reloadPeds();setCancelPed(null);
      flash('warn','Pedido #'+ped.nPedido+' cancelado por el Administrador.');
    });
  }

  function pedidoTieneImpactoCC(p){
    var fp=String(p.formaPago||'').toLowerCase();
    return fp.indexOf('cuenta')>=0||fp.indexOf('corriente')>=0||fp.indexOf('cc')>=0||!!(p.datosPago&&p.datosPago.cuentaCorriente);
  }

  function eliminarPedidoDefinitivo(p){
    if(!isAdminOrCo){flash('err','Solo Administrador o Co-Administrador puede eliminar pedidos.');return;}
    var aviso='Vas a eliminar definitivamente el Pedido #'+p.nPedido+'\nCliente: '+((p.cliente&&((p.cliente.nombre||'')+' '+(p.cliente.apellido||'')))||'—')+'\nTotal: $'+$(p.total)+'\nEstado: '+estadoLabel(p.estado)+'\n\n';
    if(pedidoTieneImpactoCC(p)){
      aviso+='ATENCIÓN: este pedido figura con Cuenta Corriente o datos de pago relacionados. Al borrar el pedido no se corrigen automáticamente movimientos de cuenta corriente ya registrados. Revisá Cuentas Corrientes si corresponde.\n\n';
    }
    aviso+='Para confirmar escribí exactamente: ELIMINAR '+p.nPedido;
    var r=prompt(aviso);
    if(r!=='ELIMINAR '+p.nPedido){flash('warn','Eliminación cancelada.');return;}
    dbDelete('pedidos',p.id).then(function(){
      reloadPeds();setDetalle(null);
      flash('ok','Pedido #'+p.nPedido+' eliminado definitivamente.');
    }).catch(function(e){flash('err','No se pudo eliminar el pedido: '+e.message);});
  }

  function abrirEliminarPruebas(){
    if(!isAdminOrCo){flash('err','Solo Administrador o Co-Administrador puede eliminar ventas de prueba.');return;}
    var ord=pedidos.slice().sort(function(a,b){return (a.nPedido||0)-(b.nPedido||0);});
    setBulkHasta(ord[0]?String(ord[Math.min(4,ord.length-1)].nPedido):'');
    setBulkCode('');
    setBulkDeleteOpen(true);
  }

  function pedidosSeleccionadosParaBorrar(){
    var hasta=parseInt(bulkHasta,10);
    if(!hasta)return [];
    return pedidos.filter(function(p){return (parseInt(p.nPedido,10)||0)<=hasta;})
      .sort(function(a,b){return (a.nPedido||0)-(b.nPedido||0);});
  }

  function eliminarPedidosDePrueba(){
    var sel=pedidosSeleccionadosParaBorrar();
    if(sel.length===0){flash('warn','No hay pedidos seleccionados para eliminar.');return;}
    if(bulkCode!=='ELIMINAR PRUEBAS'){flash('err','Para confirmar escribí ELIMINAR PRUEBAS.');return;}
    var conCC=sel.filter(pedidoTieneImpactoCC).length;
    var msg='Se eliminarán '+sel.length+' pedidos hasta el N° '+bulkHasta+'.';
    if(conCC>0)msg+=' Hay '+conCC+' pedido(s) con posible impacto en cuenta corriente. Revisá luego Cuentas Corrientes.';
    if(!confirm(msg+'\n\n¿Confirmás la eliminación definitiva?'))return;
    Promise.all(sel.map(function(p){return dbDelete('pedidos',p.id);}))
      .then(function(){setBulkDeleteOpen(false);setBulkCode('');reloadPeds();flash('ok','Se eliminaron '+sel.length+' pedido(s) de prueba.');})
      .catch(function(e){flash('err','No se pudo completar la limpieza: '+e.message);});
  }

  var users=gl('users',[]).filter(function(u){return u.role==='preventista';});
  var ESTADOS_CANCELABLES=['pendiente','preparado','listo_entrega','en_transito'];
  var ESTADOS_DESCUENTO=['pendiente','preparado','listo_entrega'];

  var filtered=pedidos.filter(function(p){
    var ok1=!q||(String(p.nPedido).includes(q)||(p.cliente.nombre+' '+p.cliente.apellido).toLowerCase().includes(q.toLowerCase())||p.preventistaNombre.toLowerCase().includes(q.toLowerCase()));
    var ok2=!filtEstado||p.estado===filtEstado;
    var ok3=!filtPrev||p.preventistaId===filtPrev;
    return ok1&&ok2&&ok3;
  }).sort(function(a,b){return b.nPedido-a.nPedido;});

  var totalFiltrado=filtered.filter(function(p){return p.estado!=='cancelado';}).reduce(function(s,p){return s+p.total;},0);

  function exportar(){
    exportXLSX([{name:'Pedidos',rows:filtered.map(function(p){return{
      'N° Pedido':p.nPedido,'Fecha':p.fecha,'Estado':estadoLabel(p.estado),
      'Preventista':p.preventistaNombre,'Cliente':p.cliente.nombre+' '+p.cliente.apellido,
      'Total':p.total,'Forma Pago':p.formaPago||'','Nota':p.nota||''
    };})}],'pedidos_alista.xlsx');
  }

  function exportarUnidadesVendidas(){
    if(!isAdminOrCo){flash('err','Solo Administrador o Co-Administrador puede exportar el resumen de stock.');return;}
    var rep=generarResumenUnidadesVendidas(pedidos,stockDesde,stockHasta,filtPrev);
    if(rep.resumen.length===0){flash('warn','No hay unidades vendidas en ese rango. Se cuentan pedidos facturados/listos/entregados/finalizados, descontando devoluciones.');return;}
    var nombre='unidades_vendidas_'+(stockDesde||'desde')+'_a_'+(stockHasta||'hasta')+'.xlsx';
    exportXLSX([
      {name:'Para Zona de Precios',rows:rep.zona},
      {name:'Resumen',rows:rep.resumen},
      {name:'Detalle pedidos',rows:rep.detalle},
      {name:'Información',rows:[{
        'Desde':stockDesde||'',
        'Hasta':stockHasta||'',
        'Preventista':filtPrev?(users.find(function(u){return u.id===filtPrev;})||{}).nombre||filtPrev:'Todos',
        'Pedidos incluidos':rep.pedidos,
        'Criterio':'Solo pedidos Entregados/Finalizados. Cantidad = enviada/preparada menos devoluciones registradas.'
      }]}
    ],nombre);
    flash('ok','Resumen exportado. Usá la hoja "Para Zona de Precios" para descontar stock.');
  }

  function verUnidadesVendidasPantalla(){
    if(!isAdminOrCo){flash('err','Solo Administrador o Co-Administrador puede ver el resumen de stock.');return;}
    var rep=generarResumenUnidadesVendidas(pedidos,stockDesde,stockHasta,filtPrev);
    setStockReport(rep);
    if(rep.resumen.length===0){flash('warn','No hay unidades vendidas en ese rango. Se cuentan pedidos facturados/listos/entregados/finalizados, descontando devoluciones.');}
  }

  var estados=['pendiente','preparado','listo_entrega','en_transito','entregado','finalizado','cancelado'];
  var bulkSelected=pedidosSeleccionadosParaBorrar();

  return E('div',null,
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'📋 Todos los Pedidos'),
        E('div',{className:'brow'},
          isAdminOrCo&&E('button',{className:'btn warn',onClick:abrirEliminarPruebas},'🧹 Eliminar pruebas'),
          isAdminOrCo&&E('button',{className:'btn',onClick:verUnidadesVendidasPantalla},'👁️ Ver unidades vendidas'),
          isAdminOrCo&&E('button',{className:'btn ok',onClick:exportarUnidadesVendidas},'📦 Excel unidades vendidas'),
          E('button',{className:'btn',onClick:exportar},'📊 Excel')
        )
      ),
      E('div',{style:{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14}},
        E('input',{className:'sinput',placeholder:'N°, cliente, preventista…',value:q,onChange:function(e){setQ(e.target.value);}}),
        isAdminOrCo&&E('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--txt2)'}},
          E('span',null,'Stock desde'),
          E('input',{className:'fi',style:{width:145},type:'date',value:stockDesde,onChange:function(e){setStockDesde(e.target.value);}})
        ),
        isAdminOrCo&&E('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--txt2)'}},
          E('span',null,'hasta'),
          E('input',{className:'fi',style:{width:145},type:'date',value:stockHasta,onChange:function(e){setStockHasta(e.target.value);}})
        ),
        E('select',{className:'fi',style:{width:'auto'},value:filtEstado,onChange:function(e){setFiltEstado(e.target.value);}},
          E('option',{value:''},'Todos los estados'),
          estados.map(function(s){return E('option',{key:s,value:s},estadoLabel(s));})
        ),
        E('select',{className:'fi',style:{width:'auto'},value:filtPrev,onChange:function(e){setFiltPrev(e.target.value);}},
          E('option',{value:''},'Todos los preventistas'),
          users.map(function(u){return E('option',{key:u.id,value:u.id},u.nombre);})
        )
      ),
      E('div',{style:{fontSize:13,color:'var(--txt2)',marginBottom:10}},
        filtered.length+' pedidos · Total: ',E('strong',{style:{color:'var(--blue)'}},'$'+$(totalFiltrado))
      ),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'N°'),E('th',null,'Fecha'),E('th',null,'Preventista'),
          E('th',null,'Cliente'),E('th',null,'Total'),E('th',null,'Pago'),E('th',null,'Estado'),E('th',null,'')
        )),
        E('tbody',null,filtered.length===0?E('tr',null,E('td',{colSpan:8,className:'empty'},'Sin resultados.')):
          filtered.map(function(p){
            return E('tr',{key:p.id},
              E('td',null,E('strong',null,'#'+p.nPedido)),
              E('td',null,fechaSolo(p.fecha)),
              E('td',null,p.preventistaNombre),
              E('td',null,p.cliente.nombre+' '+p.cliente.apellido),
              E('td',null,E('strong',{style:{color:'var(--blue)'}},'$'+$(p.total))),
              E('td',null,p.formaPago||'—'),
              E('td',null,E('span',{className:'st '+p.estado},estadoLabel(p.estado))),
              E('td',null,E('div',{className:'brow'},
                E('button',{className:'btn sm',onClick:function(){setDetalle(p);}},'👁 Ver'),
                isPreparador&&(p.estado==='pendiente'||p.estado==='listo_entrega')&&E('button',{className:'btn sm pri',onClick:function(){irATrabajarPedido(p);}},'⚙️ Trabajar'),
                isAdminOrCo&&ESTADOS_DESCUENTO.indexOf(p.estado)>=0&&E('button',{className:'btn sm ok',onClick:function(){setDescuentoModal(p);}},'💸 Descuento'),
                (p.estado==='listo_entrega'||p.estado==='en_transito'||p.estado==='entregado'||p.estado==='finalizado')?E('button',{className:'btn sm',onClick:function(){setBoletaModal(p);}},'🖨️ Boleta'):null,
                isAdminOrCo&&ESTADOS_CANCELABLES.indexOf(p.estado)>=0&&E('button',{className:'btn sm dan',onClick:function(){setCancelPed(p);}},'Cancelar'),
                isAdminOrCo&&E('button',{className:'btn sm dan',onClick:function(){eliminarPedidoDefinitivo(p);}},'Eliminar')
              ))
            );
          })
        )
      ))
    ),
    msg&&E('div',{style:{position:'fixed',bottom:20,right:20,zIndex:500}},
      E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}})
    ),
    detalle&&E(Modal,{title:'Pedido #'+detalle.nPedido+' – '+estadoLabel(detalle.estado),onClose:function(){setDetalle(null);},wide:true},
      E('div',{style:{background:'var(--bg)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
        E('div',null,'Cliente: ',E('strong',null,detalle.cliente.nombre+' '+detalle.cliente.apellido)),
        E('div',null,'Preventista: ',E('strong',null,detalle.preventistaNombre)),
        E('div',null,'Fecha: ',E('strong',null,detalle.fecha)),
        detalle.formaPago&&E('div',null,'Pago: ',E('strong',null,detalle.formaPago)),
        detalle.preparadorNombre&&E('div',null,'Preparador: ',E('strong',null,detalle.preparadorNombre)),
        detalle.notaCliente&&E('div',null,'Nota cliente: ',E('em',null,detalle.notaCliente))
      ),
      detalle.estado==='cancelado'&&E('div',{className:'alert err'},
        E('span',null,
          E('strong',null,'Cancelado por: '),detalle.canceladoPor||'—',' · ',detalle.canceladoFecha||'',
          E('br'),E('strong',null,'Motivo: '),detalle.canceladoMotivo||'—'
        )
      ),
      detalle.notaPrep&&E('div',{className:'alert warn'},E('span',null,'Nota preparador: '+detalle.notaPrep)),
      detalle.fechaEntregado&&E('div',{className:'alert ok'},E('span',null,
        E('strong',null,'Entregado: '),detalle.fechaEntregado,
        detalle.formaPago?E('span',null,' · Pago: '+detalle.formaPago):null,
        detalle.rendicion?E('span',null,' · Total cobrado: $'+$(detalle.rendicion.totalRendido||detalle.montoPago||0)):null
      )),
      detalle.devoluciones&&detalle.devoluciones.length>0&&E('div',{className:'alert warn'},E('span',null,
        E('strong',null,'Devoluciones: '),detalle.devoluciones.map(function(d){return d.desc+' x'+d.cantDev+' ('+(d.motivoDev||'sin motivo')+')';}).join(' · ')
      )),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'Artículo'),E('th',null,'Solicitado'),E('th',null,'Entregado'),E('th',null,'P.Unit.'),E('th',null,'Subtotal')
        )),
        E('tbody',null,(detalle.itemsFinales||detalle.items).map(function(it,i){
          var cant=it.cantFinal!==undefined?it.cantFinal:it.cant;
          return E('tr',{key:i},
            E('td',null,E('div',{style:{fontWeight:600}},it.desc),it.motivo&&E('div',{style:{fontSize:11,color:'var(--red)'}},it.motivo)),
            E('td',null,it.cant),
            E('td',null,E('strong',{style:{color:cant<it.cant?'var(--orange)':'var(--green)'}},cant)),
            E('td',null,'$'+$(it.pu),(parseFloat(it.descPct)||0)>0&&E('div',{style:{fontSize:10,color:'var(--green)'}},'-'+(parseFloat(it.descPct)||0)+'%')),
            E('td',null,'$'+$(cant*it.pu*(1-((parseFloat(it.descPct)||0)/100))))
          );
        }))
      )),
      E('div',{style:{textAlign:'right',marginTop:12,fontWeight:700,fontSize:15,color:'var(--blue)'}},
        'TOTAL: $'+$(detalle.total)),
      E('div',{className:'brow',style:{marginTop:16,justifyContent:'flex-end'}},
        isPreparador&&(detalle.estado==='pendiente'||detalle.estado==='listo_entrega')&&E('button',{className:'btn pri',onClick:function(){irATrabajarPedido(detalle);setDetalle(null);}},'⚙️ Trabajar en preparación/entrega'),
        isAdminOrCo&&ESTADOS_DESCUENTO.indexOf(detalle.estado)>=0&&E('button',{className:'btn ok',onClick:function(){setDescuentoModal(detalle);}},'💸 Aplicar descuentos'),
        (detalle.estado==='listo_entrega'||detalle.estado==='en_transito'||detalle.estado==='entregado'||detalle.estado==='finalizado')&&E('button',{className:'btn',onClick:function(){setBoletaModal(detalle);setDetalle(null);}},'🖨️ Ver Boleta'),
        isAdminOrCo&&ESTADOS_CANCELABLES.indexOf(detalle.estado)>=0&&E('button',{className:'btn dan',onClick:function(){setCancelPed(detalle);setDetalle(null);}},'🗑️ Cancelar'),
        isAdminOrCo&&E('button',{className:'btn dan',onClick:function(){eliminarPedidoDefinitivo(detalle);}},'Eliminar definitivo'),
        E('button',{className:'btn pri',onClick:function(){setDetalle(null);}},'Cerrar')
      )
    ),
    bulkDeleteOpen&&E(Modal,{title:'Eliminar ventas de prueba',onClose:function(){setBulkDeleteOpen(false);},wide:true},
      E('div',{className:'alert err'},E('span',null,
        E('strong',null,'Acción irreversible. '),
        'Esta opción borra pedidos del histórico para que no impacten en estadísticas ni totales. Usala solo con ventas de prueba.'
      )),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Eliminar pedidos hasta el N°'),
          E('input',{className:'fi',type:'number',value:bulkHasta,onChange:function(e){setBulkHasta(e.target.value);},placeholder:'Ej: 110'})
        ),
        E('div',{className:'fg'},E('label',null,'Confirmación'),
          E('input',{className:'fi',value:bulkCode,onChange:function(e){setBulkCode(e.target.value);},placeholder:'Escribí ELIMINAR PRUEBAS'})
        )
      ),
      E('div',{className:'alert warn'},E('span',null,
        'Seleccionados: ',E('strong',null,bulkSelected.length),' pedido(s). ',
        bulkSelected.filter(pedidoTieneImpactoCC).length>0?E('span',null,'Hay pedidos con posible impacto en cuenta corriente. Revisá Cuentas Corrientes luego de eliminarlos.'):null
      )),
      E('div',{className:'tw',style:{maxHeight:260,overflowY:'auto'}},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'N°'),E('th',null,'Fecha'),E('th',null,'Cliente'),E('th',null,'Estado'),E('th',null,'Total'))),
        E('tbody',null,bulkSelected.length===0?E('tr',null,E('td',{colSpan:5,className:'empty'},'No hay pedidos dentro de ese rango.')):
          bulkSelected.map(function(p){return E('tr',{key:p.id},
            E('td',null,'#'+p.nPedido),
            E('td',null,fechaSolo(p.fecha)),
            E('td',null,(p.cliente&&((p.cliente.nombre||'')+' '+(p.cliente.apellido||'')))||'—'),
            E('td',null,estadoLabel(p.estado)),
            E('td',null,'$'+$(p.total))
          );})
        )
      )),
      E('div',{className:'brow',style:{justifyContent:'flex-end',marginTop:14}},
        E('button',{className:'btn',onClick:function(){setBulkDeleteOpen(false);}},'Cancelar'),
        E('button',{className:'btn dan',onClick:eliminarPedidosDePrueba,disabled:bulkSelected.length===0},'Eliminar definitivamente')
      )
    ),
    cancelPed&&E(CancelModal,{ped:cancelPed,user:adminUser,
      onConfirm:handleCancelar,onClose:function(){setCancelPed(null);}}),
    boletaModal&&E(BoletaModal,{ped:boletaModal,onClose:function(){setBoletaModal(null);}}),
    descuentoModal&&E(PedidoDescuentoModal,{ped:descuentoModal,user:user,onClose:function(){setDescuentoModal(null);},onSaved:function(upd){reloadPeds();setDescuentoModal(null);setDetalle(upd);flash('ok','Descuentos guardados en el pedido #'+upd.nPedido+'.');}}),
    stockReport&&E(Modal,{title:'📦 Unidades vendidas para stock',xl:true,onClose:function(){setStockReport(null);}},
      E('div',{className:'modal-body'},
        E('div',{className:'alert info',style:{marginBottom:12}},
          E('span',null,'Rango: '+(stockDesde||'—')+' a '+(stockHasta||'—')+' · Pedidos incluidos: '+stockReport.pedidos+' · Facturados/listos/entregados/finalizados, descontando devoluciones.')
        ),
        E('div',{className:'brow',style:{justifyContent:'flex-end',marginBottom:10}},
          E('button',{className:'btn ok',onClick:exportarUnidadesVendidas},'📦 Exportar Excel')
        ),
        stockReport.resumen.length===0?E('div',{className:'empty'},'No hay unidades vendidas en ese rango.'):E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,
            E('th',null,'Código propio'),
            E('th',null,'Descripción'),
            E('th',null,'Unidades vendidas'),
            E('th',null,'Pedidos'),
            E('th',null,'Monto vendido')
          )),
          E('tbody',null,stockReport.resumen.map(function(r,i){return E('tr',{key:i},
            E('td',null,r['Código propio']||'—'),
            E('td',null,r['Artículo']||'—'),
            E('td',null,E('strong',null,r['Unidades vendidas'])),
            E('td',null,r['Pedidos']),
            E('td',null,'$'+$(r['Monto vendido']||0))
          );}))
        ))
      )
    )
  );
}

/* ═══════════════════════════
   ARTÍCULOS
═══════════════════════════ */
function Articulos(props){
  var user=props.user;
  var isAdmin=user.role==='admin'||user.role==='coadmin';
  var _a=useState([]),arts=_a[0],setArts=_a[1];
  var _b=useState(''),q=_b[0],setQ=_b[1];
  var _c=useState(null),modal=_c[0],setModal=_c[1];
  var FORM0={cod:'',codArt:'',desc:'',precio:0,costo:0,pesable:false,estado:'activo'};
  var _d=useState(FORM0),form=_d[0],setForm=_d[1];
  var _e=useState(null),msg=_e[0],setMsg=_e[1];
  var _f=useState([]),serverArts=_f[0],setServerArts=_f[1];
  var _g=useState(false),searching=_g[0],setSearching=_g[1];
  var _h=useState(null),diag=_h[0],setDiag=_h[1];

  function reload(){
    dbGet('articulos')
      .then(function(rows){
        if(rows){
          var mapped=rows.map(dbToArt).sort(function(a,b){return String(a.desc||'').localeCompare(String(b.desc||''),'es');});
          setArts(mapped);
        }
      })
      .catch(function(){flash('err','Error al cargar artículos.');});
  }
  useEffect(function(){reload();},[]);

  useEffect(function(){
    var term=(q||'').trim();
    if(term.length<2){setServerArts([]);setSearching(false);return;}
    var cancel=false;
    setSearching(true);
    dbSearchArticulos(term).then(function(rows){
      if(cancel)return;
      setServerArts((rows||[]).map(dbToArt));
      setSearching(false);
    }).catch(function(){if(!cancel)setSearching(false);});
    return function(){cancel=true;};
  },[q]);

  function F(k,v){setForm(function(f){return Object.assign({},f,{[k]:v});});}
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},5000);}

  var baseList=q&&q.trim()?mergeByIdOrCode(arts,serverArts):arts;
  var filtered=baseList.map(function(a){return {a:a,s:artScore(a,q)};})
    .filter(function(x){return !q||!q.trim()||x.s>0;})
    .sort(function(x,y){return (y.s-x.s)||String(x.a.desc||'').localeCompare(String(y.a.desc||''),'es');})
    .map(function(x){return x.a;});


  function handleSave(){
    if(!form.cod.trim()||!form.desc.trim()){flash('err','Código y descripción son obligatorios.');return;}
    var others=arts.filter(function(a){return a.id!==form.id;});
    if(others.find(function(a){return a.cod.trim()===form.cod.trim();})){flash('err','El código ya existe.');return;}
    var art=Object.assign({},form,{id:form.id||uid(),precio:parseFloat(form.precio)||0,costo:parseFloat(form.costo)||0,pesable:!!form.pesable});
    dbUpsert('articulos',artToDb(art))
      .then(function(){reload();setModal(null);flash('ok','Artículo guardado.');})
      .catch(function(e){flash('err','Error al guardar: '+e.message);});
  }

  function handleDel(id){
    if(!confirm('¿Eliminar este artículo?'))return;
    dbDelete('articulos',id)
      .then(function(){reload();flash('ok','Artículo eliminado.');})
      .catch(function(e){flash('err','Error: '+e.message);});
  }

  function toggleEstado(art){
    dbUpsert('articulos',artToDb(Object.assign({},art,{estado:art.estado==='activo'?'inactivo':'activo'})))
      .then(function(){reload();});
  }

  function doExport(){
    exportXLSX([{name:'Artículos',rows:arts.map(function(a){
      return{'Código':a.cod,'Cód.Artículo':a.codArt,'Descripción':a.desc,
        'Precio de Costo':a.costo||0,'Pesable':a.pesable?'SI':'','Precio al Público':a.precio,'Estado':a.estado};
    })}],'articulos_alista.xlsx');
  }

  function cargarXLSX(callback){
    if(typeof XLSX!=='undefined'){callback();return;}
    flash('ok','Cargando librería Excel…');
    var cdns=[
      'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    ];
    var i=0;
    function tryNext(){
      if(i>=cdns.length){callback(new Error('No se pudo cargar la librería Excel. Verificá tu conexión a internet.'));return;}
      var s=document.createElement('script');
      s.src=cdns[i++];
      s.onload=function(){callback();};
      s.onerror=function(){tryNext();};
      document.head.appendChild(s);
    }
    tryNext();
  }

  function doImport(e){
    var file=e.target.files[0];if(!file)return;
    e.target.value='';
    var ok=confirm('¿Reemplazar TODOS los artículos con los del archivo nuevo?\n\nAceptar = borra los artículos actuales y carga los nuevos.\nCancelar = no hace nada.');
    if(!ok)return;

    var desactivarOfertas=confirm('Recomendado: al actualizar la lista de precios, las ofertas relámpago actuales pueden quedar con precios viejos.\n\n¿Querés DESACTIVAR las ofertas relámpago actuales para revisarlas después?\n\nAceptar = sí, pausar ofertas relámpago actuales.\nCancelar = conservar ofertas relámpago activas.\n\nAdemás, el sistema intentará vincular las ofertas con la lista nueva y ajustar el precio manteniendo el margen sobre costo.');

    cargarXLSX(function(err){
      if(err){flash('err',err.message);return;}

      var reader=new FileReader();
      reader.onload=function(ev){
        try{
          var data=new Uint8Array(ev.target.result);
          var wb=XLSX.read(data,{type:'array'});
          var rows=extraerFilasExcel(wb);
          if(!rows.length){flash('err','El archivo está vacío o no tiene hojas legibles.');return;}
          var nuevos=[];
          var vistos={};
          var saltadasSinCodigo=0,saltadasSinDesc=0,duplicadas=0;
          var contieneCoca=0,ejemplosCoca=[];
          var muestrasPrecio=0,preciosSospechosos=0;
          rows.forEach(function(row){
            var cod=String(rowVal(row,ART_ALIAS_COD)).trim().replace(/^'/,'');
            var codArt=String(rowVal(row,ART_ALIAS_CODART)).trim().replace(/^'/,'');
            var desc=String(rowVal(row,ART_ALIAS_DESC)).trim();
            if(!cod && codArt)cod=codArt;
            if(!cod){saltadasSinCodigo++;return;}
            if(!desc){saltadasSinDesc++;return;}
            var textoBusca=normTxt([cod,codArt,desc].join(' '));
            if(textoBusca.indexOf('coca')>=0||textoBusca.indexOf('coc')>=0){
              contieneCoca++;
              if(ejemplosCoca.length<5)ejemplosCoca.push(cod+' - '+desc);
            }

            // En tu lista el encabezado real es:
            // COSTO_CON_IVA = precio de costo
            // P_MAYORISTA   = precio al público / venta usado por preventa
            // También acepta PUBLICO por compatibilidad con listas anteriores.
            // Primero intentamos esos nombres exactos y después caemos a aliases generales.
            var precio=parseMoney(rowVal(row,['P_MAYORISTA','P MAYORISTA','P.MAYORISTA','PMAYORISTA','PRECIO_MAYORISTA','PRECIO MAYORISTA','MAYORISTA','PUBLICO','PÚBLICO','PUBLICO.','PRECIO AL PUBLICO','PRECIO AL PÚBLICO','PRECIO_PUBLICO','PRECIO PUBLICO']));
            if(!precio)precio=parseMoney(rowVal(row,ART_ALIAS_PRECIO));

            var costo=parseMoney(rowVal(row,['COSTO_CON_IVA','COSTO CON IVA','COSTO CON I.V.A.','COSTO_IVA','COSTO IVA']));
            if(!costo)costo=parseMoney(rowVal(row,ART_ALIAS_COSTO));
            var pesable=boolPesable(rowVal(row,ART_ALIAS_PESABLE));

            if(precio>0&&costo>0){
              muestrasPrecio++;
              if(costo>precio)preciosSospechosos++;
            }
            var key=normTxt(cod);
            if(vistos[key]){duplicadas++;return;}
            vistos[key]=true;
            nuevos.push({id:uid(),cod:cod,codArt:codArt,desc:desc,precio:precio,costo:costo,estado:'activo',pesable:pesable});
          });
          if(!nuevos.length){flash('err','Sin filas válidas. Verificá que el archivo tenga columnas de código y descripción.');return;}

          // Seguridad: si el archivo entró con las columnas invertidas y la mayoría queda con costo mayor
          // que público, corregimos automáticamente antes de guardar.
          var autoCorrigioPrecios=false;
          if(muestrasPrecio>=10 && preciosSospechosos/muestrasPrecio>0.60){
            autoCorrigioPrecios=true;
            nuevos=nuevos.map(function(a){
              var precioOriginal=a.precio;
              return Object.assign({},a,{precio:a.costo,costo:precioOriginal});
            });
          }

          setDiag({filas:rows.length,validas:nuevos.length,sinCodigo:saltadasSinCodigo,sinDesc:saltadasSinDesc,duplicadas:duplicadas,coca:contieneCoca,ejemplos:ejemplosCoca,muestrasPrecio:muestrasPrecio,preciosSospechosos:preciosSospechosos,autoCorrigioPrecios:autoCorrigioPrecios});
          flash('ok',desactivarOfertas?'Pausando y revisando ofertas relámpago contra la lista nueva…':'Revisando ofertas relámpago contra la lista nueva…');
          dbControlarOfertasConNuevaLista(nuevos,desactivarOfertas)
            .then(function(resOferta){
              if(resOferta&&resOferta.ok){
                var txt='Ofertas revisadas: '+(resOferta.count||0)+' · Coincidencias con lista nueva: '+(resOferta.coincidencias||0)+' · Precios ajustados por margen: '+(resOferta.ajustadas||0);
                if(desactivarOfertas)txt+=' · Pausadas: '+(resOferta.pausadas||0);
                flash('ok',txt+'. Ahora actualizo artículos…');
              }else{flash('warn','No pude revisar ofertas relámpago automáticamente. Revisalas manualmente después de importar.');}
              return dbDeleteAllArticulos();
            })
            .then(function(){
              flash('ok','Cargando '+nuevos.length+' artículos en tandas…');
              return dbInsertArticulosBatch(nuevos,function(done,total){flash('ok','Cargando artículos… '+done+' de '+total);});
            })
            .then(function(){
              reload();
              var extra=contieneCoca>0?' · En el Excel detecté '+contieneCoca+' filas con COCA/COC.':' · No detecté filas con COCA/COC en el Excel.';
              var extraPrecio=autoCorrigioPrecios?' · También corregí precios invertidos.':'';
              var extraOfertas=desactivarOfertas?' · Ofertas relámpago pausadas, vinculadas si coincidían con la lista nueva, con precio revisado por margen y dudosas marcadas para revisar.':' · Ofertas relámpago conservadas, revisadas contra la lista nueva y dudosas marcadas para revisar.';
              flash('ok','✓ '+nuevos.length+' artículos cargados correctamente.'+extra+extraPrecio+extraOfertas);
            })
            .catch(function(e){flash('err','Error al importar: '+(e.message||e));});
        }catch(err2){flash('err','Error al leer el archivo: '+err2.message);}
      };
      reader.readAsArrayBuffer(file);
    });
  }



  return E('div',null,
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'📦 Artículos'),
        E('div',{className:'brow'},
          isAdmin&&E('label',{className:'btn',style:{cursor:'pointer'}},'📥 Importar Excel',
            E('input',{type:'file',accept:'.xlsx,.xls',style:{display:'none'},onChange:doImport})),
          isAdmin&&E('button',{className:'btn',onClick:doExport},'📊 Exportar'),
          isAdmin&&E('button',{className:'btn pri',onClick:function(){setForm(FORM0);setModal('new');}},'+ Nuevo')
        )
      ),
      msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
      E('input',{className:'sinput',placeholder:'Buscar por código o descripción…',value:q,onChange:function(e){setQ(e.target.value);},style:{marginBottom:8}}),
      E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:12}},
        q&&q.trim()?('Resultados visibles: '+filtered.length+' · cargados localmente: '+arts.length+(searching?' · buscando en base…':serverArts.length?' · extras desde base: '+serverArts.length:'')):
        ('Artículos cargados: '+arts.length)
      ),
      diag&&E('div',{className:'alert warn',style:{fontSize:12}},
        E('span',null,
          'Diagnóstico Excel: filas leídas '+diag.filas+' · válidas '+diag.validas+' · sin código '+diag.sinCodigo+' · sin descripción '+diag.sinDesc+' · duplicadas '+diag.duplicadas+' · filas COCA/COC '+diag.coca,
          diag.autoCorrigioPrecios?E('div',{style:{marginTop:4,fontWeight:700,color:'var(--red)'}},'⚠️ Detecté columnas/precios invertidos y los corregí: ahora P_MAYORISTA queda como Precio al Público y COSTO_CON_IVA como Precio de Costo.'):null,
          diag.ejemplos&&diag.ejemplos.length?E('div',{style:{marginTop:4}},'Ejemplos: '+diag.ejemplos.join(' | ')):null
        )
      ),
      arts.length===0?E('div',{className:'empty'},'Sin artículos. Importá un Excel o creá uno nuevo.'):
      filtered.length===0?E('div',{className:'empty'},'No se encontraron artículos para "'+q+'". Si figura en tu Excel, importalo de nuevo con esta versión y revisá el diagnóstico COCA/COC.'):
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'Código'),E('th',null,'Descripción'),E('th',null,'Venta'),E('th',null,'Precio al Público'),
          isAdmin&&E('th',null,'Precio de Costo'),E('th',null,'Estado'),
          isAdmin&&E('th',null,'')
        )),
        E('tbody',null,filtered.map(function(a){
          return E('tr',{key:a.id,style:{opacity:a.estado==='inactivo'?.5:1}},
            E('td',null,E('div',{style:{fontWeight:700}},a.cod),a.codArt&&E('div',{style:{fontSize:10,color:'var(--txt2)'}},a.codArt)),
            E('td',null,a.desc),
            E('td',null,a.pesable?'Kg':'Unidad'),
            E('td',null,'$'+$(a.precio)),
            isAdmin&&E('td',null,'$'+$(a.costo||0)),
            E('td',null,E('span',{className:'badge '+(a.estado==='activo'?'on':'off')},a.estado)),
            isAdmin&&E('td',null,E('div',{className:'brow'},
              E('button',{className:'btn sm',onClick:function(){
                setForm(Object.assign({},a));setModal('edit');
              }},'✏️'),
              E('button',{className:'btn sm '+(a.estado==='activo'?'warn':'ok'),onClick:function(){toggleEstado(a);}},
                a.estado==='activo'?'Desactivar':'Activar'),
              E('button',{className:'btn sm dan',onClick:function(){handleDel(a.id);}},'Eliminar')
            ))
          );
        }))
      ))
    ),
    modal&&E(Modal,{title:modal==='new'?'Nuevo Artículo':'Editar Artículo',onClose:function(){setModal(null);}},
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Código ',E('em',null,'*')),
          E('input',{className:'fi',value:form.cod,onChange:function(e){F('cod',e.target.value.toUpperCase());}})),
        E('div',{className:'fg'},E('label',null,'Cód. Artículo'),
          E('input',{className:'fi',value:form.codArt||'',onChange:function(e){F('codArt',e.target.value);}}))
      ),
      E('div',{className:'fg'},E('label',null,'Descripción ',E('em',null,'*')),
        E('input',{className:'fi',value:form.desc,onChange:function(e){F('desc',e.target.value);}})),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Precio al Público ($)'),
          E('input',{className:'fi',type:'number',min:0,step:0.01,value:form.precio,onChange:function(e){F('precio',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Precio de Costo ($)'),
          E('input',{className:'fi',type:'number',min:0,step:0.01,value:form.costo,onChange:function(e){F('costo',e.target.value);}}))
      ),
      E('div',{className:'fg'},E('label',null,E('input',{type:'checkbox',checked:!!form.pesable,onChange:function(e){F('pesable',e.target.checked);},style:{marginRight:8}}),'Producto pesable / se vende por kg')),
      E('div',{className:'fg'},E('label',null,'Estado'),
        E('select',{className:'fs',value:form.estado,onChange:function(e){F('estado',e.target.value);}},
          E('option',{value:'activo'},'Activo'),E('option',{value:'inactivo'},'Inactivo'))),
      E('div',{className:'brow',style:{marginTop:16}},
        E('button',{className:'btn pri',onClick:handleSave,style:{flex:1}},'💾 Guardar'),
        E('button',{className:'btn',onClick:function(){setModal(null);},style:{flex:1}},'Cancelar')
      )
    )
  );
}




/* ═══════════════════════════
   CLIENTES — carga, GPS, fotos y mapa
═══════════════════════════ */
function Clientes(props){
  var user=props.user;
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var canEdit=isAdminOrCo||user.role==='preventista'||canClientes(user)==='full';
  var _a=useState([]),clis=_a[0],setClis=_a[1];
  var _q=useState(''),q=_q[0],setQ=_q[1];
  var _m=useState(null),modal=_m[0],setModal=_m[1];
  var _f=useState({id:'',nombre:'',apellido:'',nombreFantasia:'',dir:'',tel:'',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:null,lng:null,fotos:[]}),form=_f[0],setForm=_f[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];

  function reload(){dbGetClientesLight().then(function(rows){if(Array.isArray(rows))setClis(rows.map(dbToCli));});}
  useEffect(function(){reload();},[]);
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4500);}
  function F(k,v){setForm(function(x){return Object.assign({},x,{[k]:v});});}
  function nuevo(){setForm({id:uid(),nombre:'',apellido:'',nombreFantasia:'',dir:'',tel:'',tipoCC:'Sin Tope',limCC:0,deuda:0,estado:'activo',lat:null,lng:null,fotos:[]});setModal('edit');}
  function clienteTitulo(c){return ((c.nombreFantasia||'').trim()||String(((c.nombre||'')+' '+(c.apellido||'')).trim())||'—');}
  function editar(c){setForm(Object.assign({},c,{fotos:c.fotos||[]}));setModal('edit');}
  function cambiarEstadoCliente(c){
    if(!isAdminOrCo){flash('err','Solo administrador o coadministrador puede inhabilitar clientes.');return;}
    var nuevoEstado=c.estado==='activo'?'inactivo':'activo';
    var accion=nuevoEstado==='inactivo'?'inhabilitar':'reactivar';
    var aviso=(c.deuda||0)>0?'\n\nAviso: este cliente tiene cuenta corriente/deuda de $'+$(c.deuda||0)+'. No se borra la deuda, solo se cambia el estado.':'';
    if(!confirm('¿Confirmás '+accion+' el cliente "'+clienteTitulo(c)+'"?'+aviso))return;
    dbUpdate('clientes',c.id,{estado:nuevoEstado}).then(function(){reload();flash('ok','Cliente '+(nuevoEstado==='activo'?'reactivado':'inhabilitado')+'.');}).catch(function(e){flash('err','No se pudo cambiar el estado: '+e.message);});
  }
  function eliminarCliente(c){
    if(!isAdminOrCo){flash('err','Solo administrador o coadministrador puede eliminar clientes.');return;}
    var deuda=parseFloat(c.deuda)||0;
    var tieneCC=(deuda>0)||((c.tipoCC||'Sin Tope')!=='Sin Tope')||(parseFloat(c.limCC)||0)>0;
    var aviso=tieneCC
      ? 'ATENCIÓN: este cliente tiene cuenta corriente '+(deuda>0?'con deuda de $'+$(deuda):'configurada, sin deuda actual')+'.\n\nLo más seguro es INHABILITARLO para conservar el historial.\n\n¿Querés eliminarlo igual?'
      : 'Este cliente no registra cuenta corriente pendiente.\n\n¿Querés eliminarlo definitivamente?';
    if(!confirm(aviso))return;
    if(!confirm('Última confirmación: eliminar "'+clienteTitulo(c)+'". Esta acción no se puede deshacer.'))return;
    dbDelete('clientes',c.id).then(function(){reload();flash('ok','Cliente eliminado.');}).catch(function(e){flash('err','No se pudo eliminar: '+e.message);});
  }
  function guardar(){
    if(!form.nombre.trim()||!form.apellido.trim()){flash('err','Cargá nombre y apellido del responsable.');return;}
    var row=Object.assign({},form,{limCC:parseFloat(form.limCC)||0,deuda:parseFloat(form.deuda)||0});
    dbUpsert('clientes',cliToDb(row)).then(function(){reload();setModal(null);flash('ok','Cliente guardado.');}).catch(function(e){flash('err','Error al guardar cliente: '+e.message);});
  }
  function tomarGPS(){
    if(!navigator.geolocation){flash('err','Este dispositivo no tiene GPS.');return;}
    navigator.geolocation.getCurrentPosition(function(p){
      F('lat',p.coords.latitude);F('lng',p.coords.longitude);
      flash('ok','Ubicación GPS tomada: '+gpsMapsText(p.coords.latitude,p.coords.longitude));
    },function(err){flash('err','No pude tomar GPS. Revisá permisos de ubicación.');},{enableHighAccuracy:true,timeout:20000,maximumAge:5000});
  }
  function onFotos(e){
    var files=Array.prototype.slice.call(e.target.files||[]).slice(0,5);
    if(!files.length)return;
    var out=[];
    var pending=files.length;
    files.forEach(function(file){
      var reader=new FileReader();
      reader.onload=function(ev){out.push(ev.target.result);pending--;if(pending===0)F('fotos',out);};
      reader.onerror=function(){pending--;if(pending===0)F('fotos',out);};
      reader.readAsDataURL(file);
    });
  }
  function quitarFoto(i){var fs=(form.fotos||[]).slice();fs.splice(i,1);F('fotos',fs);}

  var filtered=clis.filter(function(c){
    if(!isAdminOrCo&&c.estado!=='activo')return false;
    var hay=normTxt([c.nombre,c.apellido,c.nombreFantasia,c.dir,c.tel,c.estado].join(' '));
    return !q||hay.indexOf(normTxt(q))>=0;
  }).sort(function(a,b){return String(clienteTitulo(a)).localeCompare(String(clienteTitulo(b)),'es');});
  function hasClienteGPS(c){
    var lat=parseFloat(c.lat),lng=parseFloat(c.lng);
    return isFinite(lat)&&isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
  }
  function safePopupTxt(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  var mapClients=clis.filter(function(c){
    if(!hasClienteGPS(c))return false;
    if(!isAdminOrCo&&c.estado!=='activo')return false;
    return true;
  }).sort(function(a,b){return String(clienteTitulo(a)).localeCompare(String(clienteTitulo(b)),'es');});
  var markers=mapClients.map(function(c){
    var lat=parseFloat(c.lat),lng=parseFloat(c.lng);
    var color=c.estado==='inactivo'?'#6a7a9b':((parseFloat(c.deuda)||0)>0?'#E31E24':'#1F4788');
    var responsable=String(((c.nombre||'')+' '+(c.apellido||'')).trim())||'—';
    var popup='<strong>'+safePopupTxt(clienteTitulo(c))+'</strong><br>'+safePopupTxt(c.dir||'Sin dirección')+'<br>Responsable: '+safePopupTxt(responsable)+'<br>CC: $'+$(c.deuda||0)+'<br>'+gpsMapsText(lat,lng);
    return {lat:lat,lng:lng,color:color,popup:popup};
  });

  return E('div',{className:'clientes-page'},
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'👥 Clientes / Negocios'),
        canEdit&&E('button',{className:'btn pri',onClick:nuevo},'+ Nuevo Cliente')
      ),
      E('input',{className:'fi',placeholder:'Buscar por responsable, fantasía, dirección o teléfono…',value:q,onChange:function(e){setQ(e.target.value);},style:{marginBottom:10}}),
      E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:10}},'Clientes cargados: '+clis.length+' · Activos: '+clis.filter(function(c){return c.estado==='activo';}).length+' · Inhabilitados: '+clis.filter(function(c){return c.estado==='inactivo';}).length+' · Con GPS: '+markers.length),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Negocio'),E('th',null,'Responsable'),E('th',null,'Dirección'),E('th',null,'GPS'),E('th',null,'Deuda'),E('th',null,'Estado'),E('th',null,''))),
        E('tbody',null,filtered.length?filtered.map(function(c){return E('tr',{key:c.id,style:{opacity:c.estado==='inactivo'?0.62:1}},
          E('td',null,E('strong',null,clienteTitulo(c))),
          E('td',null,String(((c.nombre||'')+' '+(c.apellido||'')).trim())||'—'),
          E('td',null,c.dir||'—'),
          E('td',null,c.lat&&c.lng?E('span',null,gpsMapsText(c.lat,c.lng)):'—'),
          E('td',null,E('strong',{style:{color:(c.deuda||0)>0?'var(--red)':'var(--green)'}},'$'+$(c.deuda||0))),
          E('td',null,E('span',{className:'badge '+(c.estado==='activo'?'on':'off')},c.estado==='activo'?'activo':'inhabilitado')),
          E('td',null,E('div',{className:'brow clientes-actions'},
            c.lat&&c.lng&&E('a',{className:'btn sm',href:'https://www.google.com/maps?q='+c.lat+','+c.lng,target:'_blank'},'🗺️ Maps'),
            canEdit&&E('button',{className:'btn sm',onClick:function(){editar(c);}},'✏️ Editar'),
            isAdminOrCo&&E('button',{className:'btn sm warn',onClick:function(){cambiarEstadoCliente(c);}},c.estado==='activo'?'Inhabilitar':'Reactivar'),
            isAdminOrCo&&E('button',{className:'btn sm dan',onClick:function(){eliminarCliente(c);}},'Eliminar')
          ))
        );}):E('tr',null,E('td',{colSpan:7,className:'empty'},'Sin clientes.')))
      ))
    ),
    !modal&&E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🗺️ Mapa de negocios cargados'),
        E('div',{style:{fontSize:12,color:'var(--txt2)'}},markers.length+' punto'+(markers.length===1?'':'s')+' en el mapa')
      ),
      markers.length?E('div',null,
        E('div',{style:{display:'flex',gap:10,flexWrap:'wrap',fontSize:12,color:'var(--txt2)',marginBottom:10}},
          E('span',null,'🔵 Activo'),
          E('span',null,'🔴 Con deuda'),
          isAdminOrCo&&E('span',null,'⚪ Inhabilitado')
        ),
        E(LeafletMap,{key:'clientes-map-'+markers.length+'-'+markers.map(function(m){return m.lat+','+m.lng;}).join('|'),center:LOS_JURIOS,zoom:13,markers:markers,height:'clamp(320px,60vh,520px)'})
      ):E('div',{className:'empty'},'Todavía no hay clientes con GPS cargado.'),
      markers.length?E('div',{style:{fontSize:12,color:'var(--txt2)',marginTop:8}},'Tocá un punto del mapa para ver el negocio, dirección, responsable, cuenta corriente y coordenadas.'):null
    ),
    modal&&E(Modal,{title:'Cliente / Negocio',onClose:function(){setModal(null);},wide:true},
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Nombre del responsable ',E('em',null,'*')),E('input',{className:'fi',value:form.nombre,onChange:function(e){F('nombre',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Apellido del responsable ',E('em',null,'*')),E('input',{className:'fi',value:form.apellido,onChange:function(e){F('apellido',e.target.value);}}))
      ),
      E('div',{className:'fg'},E('label',null,'Nombre de fantasía del negocio'),E('input',{className:'fi',value:form.nombreFantasia||'',onChange:function(e){F('nombreFantasia',e.target.value);},placeholder:'Ej: Supermercado Don Carlos'})),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Ubicación en calle'),E('input',{className:'fi',value:form.dir||'',onChange:function(e){F('dir',e.target.value);},placeholder:'Calle, número, barrio'})),
        E('div',{className:'fg'},E('label',null,'Teléfono'),E('input',{className:'fi',value:form.tel||'',onChange:function(e){F('tel',e.target.value);}}))
      ),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Latitud GPS'),E('input',{className:'fi',value:form.lat||'',onChange:function(e){F('lat',parseFloat(e.target.value)||null);},placeholder:'Ej: -28.466'})),
        E('div',{className:'fg'},E('label',null,'Longitud GPS'),E('input',{className:'fi',value:form.lng||'',onChange:function(e){F('lng',parseFloat(e.target.value)||null);},placeholder:'Ej: -62.096'}))
      ),
      E('div',{className:'brow',style:{marginBottom:12}},
        E('button',{className:'btn ok',onClick:tomarGPS},'📍 Tomar GPS actual'),
        form.lat&&form.lng&&E('a',{className:'btn',href:'https://www.google.com/maps?q='+form.lat+','+form.lng,target:'_blank'},'Abrir en Google Maps'),
        form.lat&&form.lng&&E('span',{style:{fontSize:12,color:'var(--txt2)',alignSelf:'center'}},'Copiar: '+gpsMapsText(form.lat,form.lng))
      ),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Tipo cuenta corriente'),E('select',{className:'fs',value:form.tipoCC||'Sin Tope',onChange:function(e){F('tipoCC',e.target.value);}},E('option',{value:'Sin Tope'},'Sin Tope'),E('option',{value:'Con Tope'},'Con Tope'))),
        E('div',{className:'fg'},E('label',null,'Límite CC'),E('input',{className:'fi',type:'number',min:0,value:form.limCC||0,onChange:function(e){F('limCC',e.target.value);}}))
      ),
      isAdminOrCo&&E('div',{className:'fg'},E('label',null,'Estado del cliente'),E('select',{className:'fs',value:form.estado||'activo',onChange:function(e){F('estado',e.target.value);}},E('option',{value:'activo'},'Activo'),E('option',{value:'inactivo'},'Inhabilitado'))),
      E('div',{className:'fg'},E('label',null,'Fotos del negocio / calle (opcional, máximo 5)'),E('input',{className:'fi',type:'file',accept:'image/*',multiple:true,onChange:onFotos})),
      (form.fotos||[]).length>0&&E('div',{style:{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}},(form.fotos||[]).map(function(src,i){return E('div',{key:i,style:{position:'relative'}},E('img',{src:src,style:{width:90,height:70,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)'}}),E('button',{className:'btn sm dan',style:{position:'absolute',top:2,right:2,minHeight:24,padding:'2px 6px'},onClick:function(){quitarFoto(i);}},'×'));})),
      E('div',{className:'brow'},E('button',{className:'btn pri',onClick:guardar,style:{flex:1}},'💾 Guardar cliente'),E('button',{className:'btn',onClick:function(){setModal(null);},style:{flex:1}},'Cancelar'))
    )
  );
}

function CuentasCorrientes(props){
  var user=(props&&props.user)||{role:'admin',id:'root',nombre:'Admin'};
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isAdmin=user.role==='admin';
  var isPrev=user.role==='preventista';
  var _a=useState([]),clis=_a[0],setClis=_a[1];
  var _m=useState([]),movs=_m[0],setMovs=_m[1];
  var _v=useState([]),visitas=_v[0],setVisitas=_v[1];
  var _q=useState(''),q=_q[0],setQ=_q[1];
  var _pay=useState(null),payCli=_pay[0],setPayCli=_pay[1];
  var _ref=useState(null),refCli=_ref[0],setRefCli=_ref[1];
  var _pf=useState({monto:'',forma:'efectivo',referencia:'',obs:''}),payForm=_pf[0],setPayForm=_pf[1];
  var _rf=useState(''),refMotivo=_rf[0],setRefMotivo=_rf[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];

  function reload(){
    dbGetClientesLight().then(function(rows){if(Array.isArray(rows))setClis(rows.map(dbToCli));});
    dbGet('movimientos_cc').then(function(rows){if(Array.isArray(rows))setMovs(rows);}).catch(function(){});
    dbGet('visitas').then(function(rows){if(Array.isArray(rows))setVisitas(rows);}).catch(function(){});
  }
  useEffect(function(){reload();},[]);
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4500);}
  function PF(k,v){setPayForm(function(f){return Object.assign({},f,{[k]:v});});}
  function abrirPago(c){setPayCli(c);setPayForm({monto:c.deuda||'',forma:'efectivo',referencia:'',obs:''});}
  function parseARDateTime(v){
    v=String(v||'').trim();
    var m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if(!m)return null;
    return new Date(parseInt(m[3],10),parseInt(m[2],10)-1,parseInt(m[1],10),parseInt(m[4]||0,10),parseInt(m[5]||0,10),parseInt(m[6]||0,10));
  }
  function diasDesdeFecha(v){var d=parseARDateTime(v);if(!d)return 0;return Math.floor((new Date()-d)/(24*60*60*1000));}
  function movsCliente(c){return movs.filter(function(m){return m.cliente_id===c.id;}).sort(function(a,b){return String(a.fecha||'').localeCompare(String(b.fecha||''));});}
  function infoAtraso(c){
    if(!(parseFloat(c.deuda)||0))return {dias:0,fecha:null,atrasado:false,estado:'sin_deuda'};
    var ms=movsCliente(c);
    var debitos=ms.filter(function(m){return m.tipo==='debito'||String(m.tipo||'').toLowerCase().indexOf('deb')>=0;});
    var base=debitos.length?debitos[0]:ms[0];
    var dias=base?diasDesdeFecha(base.fecha):0;
    return {dias:dias,fecha:base?base.fecha:null,atrasado:dias>7,estado:dias>7?'atrasado':'vigente'};
  }
  function guardarPago(){
    var c=payCli;var monto=Math.max(0,parseFloat(payForm.monto)||0);
    if(!monto){flash('err','Ingresá el monto cobrado.');return;}
    var gps=gl('gps_last_'+user.id,null);
    var saldoAntes=parseFloat(c.deuda)||0;
    var saldoDespues=Math.max(0,saldoAntes-monto);
    var fechaHora=nowStr();
    var obs=(payForm.obs||'').trim();
    if(gps)obs=(obs?obs+' · ':'')+'GPS: '+gpsMapsText(gps.lat,gps.lng);
    var mov={
      id:uid(),cliente_id:c.id,cliente_nombre:(c.nombreFantasia||c.nombre+' '+c.apellido),
      tipo:'credito',monto:monto,saldo_antes:saldoAntes,saldo_despues:saldoDespues,
      fecha:fechaHora,fecha_cancelacion:fechaHora,hora_cancelacion:horaSolo(fechaHora),
      usuario_id:user.id,usuario_nombre:user.nombre||user.username,pedido_id:null,
      forma_pago:payForm.forma,referencia:payForm.referencia||null,observaciones:obs||null
    };
    dbUpsert('movimientos_cc',mov).then(function(){return dbUpdate('clientes',c.id,{deuda:saldoDespues});}).then(function(){
      if(gps){return dbUpsert('visitas',{id:uid(),cliente_id:c.id,cliente_nombre:c.nombre+' '+c.apellido,preventista_id:user.id,preventista_nombre:user.nombre||user.username,fecha:fechaHora,lat:gps.lat,lng:gps.lng,observaciones:'Pago recibido: $'+$(monto)+' · '+payForm.forma+' · Saldo: $'+$(saldoDespues)});}
    }).then(function(){auditRecord(user,'cobro','Cobro registrado',{cliente_id:c.id,cliente_nombre:(c.nombreFantasia||c.nombre+' '+c.apellido),monto:monto,resultado:'cobrado',observaciones:'Forma: '+payForm.forma+' · Saldo: $'+$(saldoDespues)});setPayCli(null);reload();flash('ok','Pago registrado con fecha, hora y forma de cancelación.');}).catch(function(e){flash('err','Error al registrar pago: '+e.message);});
  }
  function guardarNegativa(){
    var c=refCli;if(!refMotivo.trim()){flash('err','Escribí el motivo por el que no pagó.');return;}
    var gps=gl('gps_last_'+user.id,null);
    var visita={id:uid(),cliente_id:c.id,cliente_nombre:c.nombre+' '+c.apellido,preventista_id:user.id,preventista_nombre:user.nombre||user.username,fecha:nowStr(),lat:gps?gps.lat:null,lng:gps?gps.lng:null,observaciones:'SE NEGÓ A PAGAR: '+refMotivo.trim()};
    dbUpsert('visitas',visita).then(function(){auditRecord(user,'visita','Negativa de pago',{cliente_id:c.id,cliente_nombre:(c.nombreFantasia||c.nombre+' '+c.apellido),resultado:'no_pago',observaciones:refMotivo.trim()});setRefCli(null);setRefMotivo('');reload();flash('warn','Negativa de pago registrada.');}).catch(function(e){flash('err','Error al guardar negativa: '+e.message);});
  }

  var deudores=clis.filter(function(c){return (c.deuda||0)>0;}).filter(function(c){var hay=normTxt([c.nombre,c.apellido,c.nombreFantasia,c.dir,c.tel].join(' '));return !q||hay.indexOf(normTxt(q))>=0;}).sort(function(a,b){return b.deuda-a.deuda;});
  var totalDeuda=deudores.reduce(function(s,c){return s+(parseFloat(c.deuda)||0);},0);
  var atrasados=deudores.filter(function(c){return infoAtraso(c).atrasado;});
  var deudaAtrasada=atrasados.reduce(function(s,c){return s+(parseFloat(c.deuda)||0);},0);
  function histMov(c){return movs.filter(function(m){return m.cliente_id===c.id;}).sort(function(a,b){return String(b.fecha||'').localeCompare(String(a.fecha||''));}).slice(0,5);}
  function histNeg(c){return visitas.filter(function(v){return v.cliente_id===c.id&&String(v.observaciones||'').indexOf('SE NEGÓ A PAGAR')>=0;}).sort(function(a,b){return String(b.fecha||'').localeCompare(String(a.fecha||''));}).slice(0,3);}

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    isAdmin&&E('div',{className:'card'},
      E('div',{className:'card-title'},'📊 Resumen administrador de cuentas corrientes'),
      E('div',{className:'kpi-row'},
        E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Total deuda CC'),E('div',{className:'kpi-val'},'$'+$i(totalDeuda))),
        E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Clientes con deuda'),E('div',{className:'kpi-val'},deudores.length)),
        E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Más de 7 días'),E('div',{className:'kpi-val'},atrasados.length)),
        E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Deuda atrasada'),E('div',{className:'kpi-val'},'$'+$i(deudaAtrasada)))
      ),
      atrasados.length?E('div',{className:'alert err'},E('span',null,'⚠ Hay clientes con más de 7 días de atraso sin regularizar. Revisá la columna “Atraso”.')):E('div',{className:'alert ok'},E('span',null,'No hay clientes con más de 7 días de atraso.'))
    ),
    !isAdmin&&E('div',{className:'kpi-row'},
      E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Clientes con deuda'),E('div',{className:'kpi-val'},deudores.length)),
      isPrev&&E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'GPS para cobro'),E('div',{className:'kpi-val',style:{fontSize:16}},gl('gps_last_'+user.id,null)?'Activo':'Apagado'))
    ),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'💳 Cuentas Corrientes / Cobranza'),E('button',{className:'btn',onClick:reload},'Actualizar')),
      E('div',{className:'alert warn'},E('span',null,'Los cobros quedan asentados con forma de pago, fecha y hora. Administrador y preventista pueden registrar cobros; el resumen general solo aparece para administrador.')),
      E('input',{className:'fi',placeholder:'Buscar cliente o negocio…',value:q,onChange:function(e){setQ(e.target.value);},style:{marginBottom:10}}),
      deudores.length===0?E('div',{className:'empty'},'No hay deudas pendientes.'):E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Cliente'),E('th',null,'Dirección'),E('th',null,'Tipo CC'),E('th',null,'Deuda'),E('th',null,'Atraso'),E('th',null,'Historial'),E('th',null,''))),
        E('tbody',null,deudores.map(function(c){var hm=histMov(c),hn=histNeg(c),atr=infoAtraso(c);return E('tr',{key:c.id,className:atr.atrasado?'row-alert':''},
          E('td',null,E('strong',null,c.nombreFantasia||c.nombre+' '+c.apellido),E('div',{style:{fontSize:11,color:'var(--txt2)'}},c.nombre+' '+c.apellido)),
          E('td',null,c.dir||'—'),
          E('td',null,c.tipoCC||'Sin Tope'),
          E('td',null,E('strong',{style:{color:'var(--red)'}},'$'+$(c.deuda||0))),
          E('td',null,atr.fecha?E('div',null,
            E('span',{className:atr.atrasado?'badge bad':'badge ok'},atr.atrasado?'⚠ '+atr.dias+' días':'Al día'),
            E('div',{style:{fontSize:10,color:'var(--txt2)',marginTop:3}},'Desde '+fechaSolo(atr.fecha))
          ):E('span',{className:'badge'},'Sin fecha')),
          E('td',null,
            hm.length?E('div',{style:{fontSize:11}},hm.map(function(m,i){return E('div',{key:i},fechaSolo(m.fecha)+' '+horaSolo(m.fecha)+' · '+(m.usuario_nombre||'')+' · $'+$(m.monto)+' · '+(m.forma_pago||''));})):E('div',{style:{fontSize:11,color:'var(--txt2)'}},'Sin pagos registrados'),
            hn.length?E('div',{style:{fontSize:11,color:'var(--orange)',marginTop:4}},'Negativas: '+hn.length):null
          ),
          E('td',null,E('div',{className:'brow'},
            E('button',{className:'btn sm ok',onClick:function(){abrirPago(c);}},'💵 Cobrar'),
            E('button',{className:'btn sm warn',onClick:function(){setRefCli(c);setRefMotivo('');}},'📝 No pagó'),
            c.lat&&c.lng&&E('a',{className:'btn sm',href:'https://www.google.com/maps?q='+c.lat+','+c.lng,target:'_blank'},'🗺️')
          ))
        );}))
      ))
    ),
    payCli&&E(Modal,{title:'Registrar cobro — '+(payCli.nombreFantasia||payCli.nombre+' '+payCli.apellido),onClose:function(){setPayCli(null);}},
      E('div',{className:'alert warn'},E('span',null,'Deuda actual: $'+$(payCli.deuda||0)+' · Fecha y hora: '+nowStr()+' · El GPS se guarda si el recorrido está activo.')),
      E('div',{className:'fg'},E('label',null,'Monto recibido'),E('input',{className:'fi',type:'number',min:0,step:0.01,value:payForm.monto,onChange:function(e){PF('monto',e.target.value);}})),
      E('div',{className:'fg'},E('label',null,'Forma de cancelación'),E('select',{className:'fs',value:payForm.forma,onChange:function(e){PF('forma',e.target.value);}},E('option',{value:'efectivo'},'Efectivo'),E('option',{value:'transferencia'},'Transferencia'),E('option',{value:'cheque'},'Cheque'),E('option',{value:'mercadopago'},'Mercado Pago'),E('option',{value:'otro'},'Otro'))),
      E('div',{className:'fg'},E('label',null,'Referencia / comprobante'),E('input',{className:'fi',value:payForm.referencia,onChange:function(e){PF('referencia',e.target.value);},placeholder:'N° transferencia, cheque, nota, etc.'})),
      E('div',{className:'fg'},E('label',null,'Observaciones'),E('textarea',{className:'fi',rows:3,value:payForm.obs,onChange:function(e){PF('obs',e.target.value);}})),
      gl('gps_last_'+user.id,null)&&E('div',{style:{fontSize:12,color:'var(--green)',marginBottom:10}},'📍 GPS activo: '+gpsMapsText(gl('gps_last_'+user.id,null).lat,gl('gps_last_'+user.id,null).lng)),
      E('div',{className:'brow'},E('button',{className:'btn ok',onClick:guardarPago,style:{flex:1}},'Guardar cobro'),E('button',{className:'btn',onClick:function(){setPayCli(null);},style:{flex:1}},'Cancelar'))
    ),
    refCli&&E(Modal,{title:'Cliente no pagó — '+(refCli.nombreFantasia||refCli.nombre+' '+refCli.apellido),onClose:function(){setRefCli(null);}},
      E('div',{className:'fg'},E('label',null,'Motivo'),E('textarea',{className:'fi',rows:4,value:refMotivo,onChange:function(e){setRefMotivo(e.target.value);},placeholder:'Ej: No tenía efectivo, dueño ausente, pidió pasar mañana, desconoce deuda…'})),
      gl('gps_last_'+user.id,null)&&E('div',{style:{fontSize:12,color:'var(--green)',marginBottom:10}},'📍 GPS activo: '+gpsMapsText(gl('gps_last_'+user.id,null).lat,gl('gps_last_'+user.id,null).lng)),
      E('div',{className:'brow'},E('button',{className:'btn warn',onClick:guardarNegativa,style:{flex:1}},'Guardar negativa'),E('button',{className:'btn',onClick:function(){setRefCli(null);},style:{flex:1}},'Cancelar'))
    )
  );
}

/* ═══════════════════════════
   ESTADÍSTICAS
═══════════════════════════ */
function BarChart(props){
  var ref=useRef();
  useEffect(function(){
    var cv=ref.current;if(!cv||!props.data.length)return;
    var ctx=cv.getContext('2d');
    var W=cv.width,H=cv.height,PL=62,PR=16,PT=18,PB=46,cW=W-PL-PR,cH=H-PT-PB;
    ctx.clearRect(0,0,W,H);
    var maxV=Math.max.apply(null,props.data.map(function(d){return d.v;}).concat([1]));
    var gap=cW/props.data.length;
    var bW=Math.min(gap*.68,44);
    var color=props.color||'#1F4788';
    for(var i=0;i<=4;i++){
      var gy=PT+cH*(1-i/4);
      ctx.strokeStyle='#eaecf4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PL,gy);ctx.lineTo(PL+cW,gy);ctx.stroke();
      ctx.fillStyle='#9aaabf';ctx.font='10px sans-serif';ctx.textAlign='right';
      ctx.fillText('$'+$i(maxV*i/4),PL-5,gy+4);
    }
    ctx.strokeStyle='#d0d6e8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PL,PT);ctx.lineTo(PL,PT+cH);ctx.lineTo(PL+cW,PT+cH);ctx.stroke();
    props.data.forEach(function(d,i){
      var bH=d.v>0?(d.v/maxV)*cH:0;
      var x=PL+gap*i+(gap-bW)/2,y=PT+cH-bH;
      var g=ctx.createLinearGradient(x,y,x,PT+cH);g.addColorStop(0,color);g.addColorStop(1,color+'44');
      ctx.fillStyle=g;ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(x,y,bW,bH,3);else ctx.rect(x,y,bW,bH);
      ctx.fill();
      ctx.fillStyle='#7888a0';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(d.l,x+bW/2,PT+cH+18);
      if(bH>22){ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.fillText('$'+$i(d.v),x+bW/2,y+14);}
    });
  },[props.data,props.color]);
  if(!props.data.length)return E('div',{className:'empty'},'Sin datos para el período.');
  return E('div',{style:{width:'100%',overflowX:'auto'}},
    E('canvas',{ref:ref,className:'bc',width:660,height:200,style:{height:'200px'}}));
}

function Estadisticas(){
  var _a=useState('mes'),period=_a[0],setPeriod=_a[1];
  var _b=useState([]),pedidos=_b[0],setPedidos=_b[1];
  var _c=useState([]),clis=_c[0],setClis=_c[1];
  useEffect(function(){
    dbGet('pedidos').then(function(rows){if(rows)setPedidos(rows.map(dbToPed));});
    dbGetClientesLight().then(function(rows){if(rows)setClis(rows.map(dbToCli));});
  },[]);
  var filtered=pedidos.filter(function(p){return inPeriodPedido(p,period);});
  var finalizados=filtered.filter(pedidoEsVendido);

  var totalVendido=finalizados.reduce(function(s,p){return s+p.total;},0);
  var totalCosto=finalizados.reduce(function(s,p){return s+(p.itemsFinales||p.items).reduce(function(si,it){var c=it.cantFinal!==undefined?it.cantFinal:it.cant;return si+c*(it.costo||0);},0);},0);
  var totalGanancia=totalVendido-totalCosto;
  var margen=totalVendido>0?Math.round(totalGanancia/totalVendido*100):0;
  var totalDeuda=clis.reduce(function(s,c){return s+c.deuda;},0);

  var countEstado=function(s){return filtered.filter(function(p){return p.estado===s;}).length;};

  // By day
  var byDay={};
  finalizados.forEach(function(p){var d=fechaSolo(pedidoFechaComercial(p)).trim();byDay[d]=(byDay[d]||0)+p.total;});
  var dayData=Object.entries(byDay).map(function(kv){return {l:kv[0].slice(0,5),v:kv[1]};}).slice(-12);

  // By preventista
  var byPrev={};
  finalizados.forEach(function(p){if(!byPrev[p.preventistaId])byPrev[p.preventistaId]={nombre:p.preventistaNombre,monto:0,n:0};byPrev[p.preventistaId].monto+=p.total;byPrev[p.preventistaId].n+=1;});
  var prevArr=Object.values(byPrev).sort(function(a,b){return b.monto-a.monto;});
  var prevChart=prevArr.slice(0,6).map(function(v){return {l:v.nombre.split(' ')[0],v:v.monto};});

  // Top articulos
  var byArt={};
  finalizados.forEach(function(p){(p.itemsFinales||p.items).forEach(function(it){var k=it.artId||it.cod;if(!byArt[k])byArt[k]={nombre:it.desc,cant:0,monto:0,costo:0};var c=it.cantFinal!==undefined?it.cantFinal:it.cant;byArt[k].cant+=c;byArt[k].monto+=c*it.pu*(1-((parseFloat(it.descPct)||0)/100));byArt[k].costo+=c*(it.costo||0);});});
  var artArr=Object.values(byArt).sort(function(a,b){return b.monto-a.monto;}).slice(0,5);

  // Faltantes y reemplazos
  var byFaltante={};
  finalizados.forEach(function(p){
    if(!p.itemsFinales)return;
    p.itemsFinales.forEach(function(it){
      if(it.tipo==='original'&&it.cantFinal<it.cant){
        var k=it.artId||it.cod;
        if(!byFaltante[k])byFaltante[k]={nombre:it.desc,veces:0,cantFaltante:0};
        byFaltante[k].veces+=1;byFaltante[k].cantFaltante+=(it.cant-it.cantFinal);
      }
    });
  });
  var faltArr=Object.values(byFaltante).sort(function(a,b){return b.veces-a.veces;}).slice(0,8);

  // Devoluciones stats
  var byDevArt={};
  finalizados.forEach(function(p){
    if(!p.devoluciones||!p.devoluciones.length)return;
    p.devoluciones.forEach(function(d){
      var k=d.artId||d.cod;
      if(!byDevArt[k])byDevArt[k]={nombre:d.desc,veces:0,cant:0,monto:0};
      byDevArt[k].veces+=1;byDevArt[k].cant+=d.cantDev||0;byDevArt[k].monto+=(d.cantDev||0)*(d.pu||0);
    });
  });
  var devArtArr=Object.values(byDevArt).sort(function(a,b){return b.veces-a.veces;}).slice(0,8);

  return E('div',null,
    E(PeriodBar,{val:period,onChange:setPeriod}),
    E('div',{className:'kpi-row'},
      E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Total Vendido'),E('div',{className:'kpi-val'},'$'+$i(totalVendido))),
      totalCosto>0&&E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Ganancia Est.'),E('div',{className:'kpi-val'},'$'+$i(totalGanancia))),
      totalCosto>0&&E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Margen'),E('div',{className:'kpi-val'},margen+'%')),
      E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Total Deudas CC'),E('div',{className:'kpi-val'},'$'+$i(totalDeuda))),
      E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pendientes'),E('div',{className:'kpi-val'},countEstado('pendiente'))),
      E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Finalizados'),E('div',{className:'kpi-val'},finalizados.length)),
      E('div',{className:'kpi dan'},E('div',{className:'kpi-label'},'Cancelados'),E('div',{className:'kpi-val'},countEstado('cancelado'))),
    ),
    countEstado('cancelado')>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'🗑️ Cancelaciones'),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'N°'),E('th',null,'Fecha'),E('th',null,'Preventista'),E('th',null,'Cliente'),E('th',null,'Motivo'),E('th',null,'Cancelado por')
        )),
        E('tbody',null,filtered.filter(function(p){return p.estado==='cancelado';}).map(function(p){
          return E('tr',{key:p.id},
            E('td',null,'#'+p.nPedido),
            E('td',null,p.fecha?fechaSolo(p.fecha):'—'),
            E('td',null,p.preventistaNombre),
            E('td',null,p.cliente.nombre+' '+p.cliente.apellido),
            E('td',null,p.canceladoMotivo||'—'),
            E('td',null,p.canceladoPor||'—')
          );
        }))
      ))
    ),
    totalCosto===0&&E('div',{className:'alert warn'},E('span',null,'💡 Cargá Precio de Costo en artículos para ver ganancia y margen.')),
    E('div',{className:'card'},E('div',{className:'card-title'},'📅 Ventas por Día'),E(BarChart,{data:dayData,color:'#1F4788'})),
    E('div',{className:'card'},E('div',{className:'card-title'},'👤 Ventas por Preventista'),E(BarChart,{data:prevChart,color:'#1a9e5c'})),
    E('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}},
      E('div',{className:'card',style:{marginBottom:0}},
        E('div',{className:'card-title'},'📦 Top 5 Artículos'),
        artArr.length===0?E('div',{className:'empty'},'Sin datos.'):
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Artículo'),E('th',null,'Cant.'),E('th',null,'Venta'),E('th',null,'Ganancia'))),
          E('tbody',null,artArr.map(function(a,i){
            var gan=a.costo>0?a.monto-a.costo:null;
            return E('tr',{key:i},E('td',null,a.nombre),E('td',null,a.cant),E('td',null,'$'+$(a.monto)),
              E('td',null,gan!==null?E('strong',{style:{color:'var(--green)'}},'$'+$(gan)):E('span',{style:{color:'var(--txt2)',fontSize:11}},'sin costo')));
          }))
        ))
      ),
      E('div',{className:'card',style:{marginBottom:0}},
        E('div',{className:'card-title'},'💵 Ventas por Preventista'),
        prevArr.length===0?E('div',{className:'empty'},'Sin datos.'):
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Preventista'),E('th',null,'Pedidos'),E('th',null,'Total'))),
          E('tbody',null,prevArr.map(function(v,i){return E('tr',{key:i},E('td',null,v.nombre),E('td',null,v.n),E('td',null,E('strong',{style:{color:'var(--blue)'}},'$'+$(v.monto))));
          }))
        ))
      )
    ),
    faltArr.length>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'⚠️ Artículos con Faltante Frecuente'),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Artículo'),E('th',null,'Veces faltó'),E('th',null,'Total unidades faltantes'))),
        E('tbody',null,faltArr.map(function(a,i){
          return E('tr',{key:i},
            E('td',null,a.nombre),
            E('td',null,E('span',{style:{fontWeight:700,color:'var(--red)'}},a.veces,'x')),
            E('td',null,a.cantFaltante,' unidades')
          );
        }))
      ))
    ),
    devArtArr.length>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'↩️ Artículos más Devueltos'),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Artículo'),E('th',null,'Veces devuelto'),E('th',null,'Unidades'),E('th',null,'Monto devuelto'))),
        E('tbody',null,devArtArr.map(function(a,i){
          return E('tr',{key:i},
            E('td',null,a.nombre),
            E('td',null,E('span',{style:{fontWeight:700,color:'var(--orange)'}},a.veces,'x')),
            E('td',null,a.cant),
            E('td',null,'$'+$(a.monto))
          );
        }))
      ))
    )
  );
}

/* ═══════════════════════════
   COMISIONES
═══════════════════════════ */
function Comisiones(){
  var _a=useState(gl('comisiones',{})),com=_a[0],setCom=_a[1];
  var _b=useState('mes'),period=_b[0],setPeriod=_b[1];
  var _pu=useState([]),usersDB=_pu[0],setUsersDB=_pu[1];
  var _pd=useState([]),pedidosDB=_pd[0],setPedidosDB=_pd[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];
  function cargarComisiones(){
    Promise.all([
      dbGet('pedidos').then(function(rows){var ps=Array.isArray(rows)?rows.map(dbToPed):[];setPedidosDB(ps);sl('pedidos_cache',ps);return ps;}),
      dbGet('usuarios').then(function(rows){var us=Array.isArray(rows)?rows.map(dbToUser):[];setUsersDB(us);return us;})
    ]).then(function(){setMsg({t:'ok',m:'Comisiones actualizadas.'});}).catch(function(){setMsg({t:'warn',m:'No se pudo actualizar desde Supabase. Se usa la información local disponible.'});});
  }
  useEffect(function(){cargarComisiones();},[]);
  var users=(usersDB.length?usersDB:gl('users',[])).filter(function(u){return u.role==='preventista'||u.role==='coadmin';});
  var pedidosBase=pedidosDB.length?pedidosDB:gl('pedidos_cache',[]);
  function setCom1(id,val){var u=Object.assign({},com);u[id]=parseFloat(val)||0;setCom(u);sl('comisiones',u);}
  function calc(uid){
    var vv=(pedidosBase||[]).filter(function(p){return String(p.preventistaId)===String(uid)&&pedidoEsVendido(p)&&inPeriodPedido(p,period);});
    var total=vv.reduce(function(s,p){return s+(parseFloat(p.total)||0);},0);
    return {total:total,comision:total*(parseFloat(com[uid])||0)/100,n:vv.length};
  }
  var totalGeneral=users.reduce(function(s,u){return s+calc(u.id).total;},0);
  var comGeneral=users.reduce(function(s,u){return s+calc(u.id).comision;},0);
  function doExport(){
    exportXLSX([{name:'Comisiones',rows:users.map(function(u){var c=calc(u.id);return {'Preventista':u.nombre||u.username,'% Comisión':com[u.id]||0,'Pedidos vendidos':c.n,'Total vendido':c.total,'Comisión':c.comision};})}],'comisiones_alista.xlsx');
  }
  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'💵 Comisiones'),E('div',{className:'brow'},E('button',{className:'btn',onClick:cargarComisiones},'🔄 Actualizar'),E('button',{className:'btn ok',onClick:doExport},'📊 Excel'))),
      E('div',{className:'alert warn'},E('span',null,'Las comisiones se calculan sobre pedidos ENTREGADOS o FINALIZADOS del período seleccionado. Los pendientes no computan.')),
      E(PeriodBar,{val:period,onChange:setPeriod}),
      E('div',{className:'kpi-row'},
        E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Total vendido computable'),E('div',{className:'kpi-val'},'$'+$i(totalGeneral))),
        E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Comisión total'),E('div',{className:'kpi-val'},'$'+$i(comGeneral)))
      ),
      users.length===0?E('div',{className:'empty'},'No hay preventistas creados.'):
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Preventista'),E('th',null,'% Comisión'),E('th',null,'Pedidos vendidos'),E('th',null,'Total vendido'),E('th',null,'Comisión'))),
        E('tbody',null,users.map(function(u){var c=calc(u.id);return E('tr',{key:u.id},
          E('td',null,E('strong',null,u.nombre||u.username)),
          E('td',null,E('div',{style:{display:'flex',alignItems:'center',gap:6}},
            E('input',{type:'number',min:0,max:20,step:0.5,value:com[u.id]||0,onChange:function(e){setCom1(u.id,e.target.value);},style:{width:65,padding:'5px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontFamily:'inherit'}}),'%')),
          E('td',null,c.n),E('td',null,'$'+$(c.total)),E('td',null,E('strong',{style:{color:'var(--green)'}},'$'+$(c.comision)))
        );}))
      ))
    )
  );
}

/* ═══════════════════════════
   AUDITORÍA DE RECORRIDOS (Admin / CoAdmin)
═══════════════════════════ */
function AuditoriaRecorridos(props){
  var user=props.user;
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var _u=useState([]),usuarios=_u[0],setUsuarios=_u[1];
  var _p=useState([]),pedidos=_p[0],setPedidos=_p[1];
  var _v=useState([]),visitas=_v[0],setVisitas=_v[1];
  var _m=useState([]),movs=_m[0],setMovs=_m[1];
  var _c=useState([]),clientes=_c[0],setClientes=_c[1];
  var _gp=useState([]),gpsRemotos=_gp[0],setGpsRemotos=_gp[1];
  var _ae=useState([]),auditEventos=_ae[0],setAuditEventos=_ae[1];
  var hoyIso=(new Date()).toISOString().slice(0,10);
  var _fd=useState(hoyIso),fechaDesde=_fd[0],setFechaDesde=_fd[1];
  var _fh=useState(hoyIso),fechaHasta=_fh[0],setFechaHasta=_fh[1];
  var _sel=useState('todos'),preventistaId=_sel[0],setPreventistaId=_sel[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];

  if(!isAdminOrCo)return E('div',{className:'empty'},'Módulo disponible solo para Administrador o Co-Administrador.');

  function dateInputToAR(v){
    if(!v)return todayStr();
    var p=String(v).split('-');
    if(p.length!==3)return v;
    return parseInt(p[2],10)+'/'+parseInt(p[1],10)+'/'+p[0];
  }
  function dateInputToGpsKey(v){return dateInputToAR(v).replace(/\//g,'-');}
  function fechaCoincideAudit(f,v){return String(f||'').indexOf(dateInputToAR(v))>=0;}
  function fechaEnRangoAudit(f){return fechaEnRangoISO(f,fechaDesde,fechaHasta);}
  function fechaDiaEnRangoAudit(iso){iso=String(iso||'').slice(0,10);return iso&&(!fechaDesde||iso>=fechaDesde)&&(!fechaHasta||iso<=fechaHasta);}
  function auditLocalEventsForRange(){var synced=auditGetSynced(),pend=auditGetPending();return synced.concat(pend).filter(function(e){return fechaDiaEnRangoAudit(e.fecha_dia);});}
  function esEntregadoAudit(p){return p.estado==='entregado'||p.estado==='finalizado';}
  function esRechazadoAudit(p){return p.estado==='cancelado'||((p.devoluciones||[]).length>0);}
  function preventistaNombre(id){
    var u=usuarios.find(function(x){return x.id===id;});
    return u?(u.nombre||u.username):'—';
  }
  function gpsKeyFor(id){return 'gps_'+id+'_'+dateInputToGpsKey(fechaDesde);}
  function gpsPointsFor(id){
    var remote=gpsRemotos.filter(function(p){return String(p.usuario_id)===String(id)&&fechaDiaEnRangoAudit(p.fecha_dia)&&p.lat&&p.lng;})
      .map(function(p){return {lat:parseFloat(p.lat),lng:parseFloat(p.lng),ts:parseInt(p.ts,10)||Date.parse(p.created_at||'')||0};})
      .sort(function(a,b){return (a.ts||0)-(b.ts||0);});
    if(remote.length)return remote;
    return gl(gpsKeyFor(id),[]).filter(function(p){return p&&p.lat&&p.lng;});
  }
  function distanciaKm(points){
    function rad(x){return x*Math.PI/180;}
    var km=0;
    for(var i=1;i<points.length;i++){
      var a=points[i-1],b=points[i];
      var R=6371;
      var dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng);
      var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);
      km+=2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
    }
    return km;
  }
  function horaFromTs(ts){
    if(!ts)return '—';
    try{return new Date(ts).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});}catch(e){return '—';}
  }
  function clienteName(v){return v.cliente_nombre||v.clienteNombre||'Cliente';}

  function cargar(){
    dbGet('usuarios').then(function(rows){if(Array.isArray(rows))setUsuarios(rows.map(dbToUser).filter(function(u){return u.role==='preventista';}));}).catch(function(){});
    dbGet('pedidos').then(function(rows){if(Array.isArray(rows))setPedidos(rows.map(dbToPed));}).catch(function(){});
    dbGet('visitas').then(function(rows){if(Array.isArray(rows))setVisitas(rows);}).catch(function(){});
    dbGet('movimientos_cc').then(function(rows){if(Array.isArray(rows))setMovs(rows);}).catch(function(){});
    dbGet('movimientos_cc').then(function(rows){if(Array.isArray(rows))setMovs(rows);}).catch(function(){});
    dbGetClientesLight().then(function(rows){if(Array.isArray(rows))setClientes(rows.map(dbToCli));}).catch(function(){});
    dbGet('gps_puntos').then(function(rows){if(Array.isArray(rows))setGpsRemotos(rows);}).catch(function(){});
    dbGet('auditoria_eventos').then(function(rows){if(Array.isArray(rows))setAuditEventos(rows.concat(auditLocalEventsForRange()));}).catch(function(){setAuditEventos(auditLocalEventsForRange());});
  }
  useEffect(function(){cargar();var iv=setInterval(cargar,15000);return function(){clearInterval(iv);};},[fechaDesde,fechaHasta,preventistaId]);

  var preventistas=usuarios.filter(function(u){return u.activo!==false;});
  var idsSeleccionados=preventistaId==='todos'?preventistas.map(function(u){return u.id;}):[preventistaId];
  var pedidosDia=pedidos.filter(function(p){return fechaEnRangoAudit(p.fecha)||fechaEnRangoAudit(p.fechaEntregado)||fechaEnRangoAudit(p.fechaPreparado);})
    .filter(function(p){return preventistaId==='todos'||p.preventistaId===preventistaId;});
  var visitasDia=visitas.filter(function(v){return fechaEnRangoAudit(v.fecha);})
    .filter(function(v){return preventistaId==='todos'||v.preventista_id===preventistaId;});
  var movsDia=movs.filter(function(m){return fechaEnRangoAudit(m.fecha);})
    .filter(function(m){return preventistaId==='todos'||m.usuario_id===preventistaId;});
  var eventosDia=auditEventos.filter(function(e){return fechaDiaEnRangoAudit(e.fecha_dia);})
    .filter(function(e){return preventistaId==='todos'||String(e.usuario_id)===String(preventistaId);});
  var eventosPedido=eventosDia.filter(function(e){return e.tipo==='pedido';}).length;
  var eventosVisita=eventosDia.filter(function(e){return e.tipo==='visita';}).length;
  var eventosCobro=eventosDia.filter(function(e){return e.tipo==='cobro';}).length;
  var eventosSinGPS=eventosDia.filter(function(e){return e.gps_estado!=='ok';}).length;

  var clientesUnicos={};
  visitasDia.forEach(function(v){if(v.cliente_id)clientesUnicos[v.cliente_id]=true;});
  var cobros=movsDia.filter(function(m){return m.tipo==='credito';});
  var totalCobrado=cobros.reduce(function(s,m){return s+(parseFloat(m.monto)||0);},0);
  var negativas=visitasDia.filter(function(v){return String(v.observaciones||'').indexOf('SE NEGÓ A PAGAR')>=0;});
  var pedidosCreados=pedidosDia.filter(function(p){return fechaEnRangoAudit(p.fecha);}).length;
  var pedidosEntregados=pedidosDia.filter(esEntregadoAudit).length;
  var pedidosRechazados=pedidosDia.filter(esRechazadoAudit).length;

  function resumenPreventista(u){
    var vs=visitas.filter(function(v){return v.preventista_id===u.id&&fechaEnRangoAudit(v.fecha);});
    var ps=pedidos.filter(function(p){return p.preventistaId===u.id&&(fechaEnRangoAudit(p.fecha)||fechaEnRangoAudit(p.fechaEntregado)||fechaEnRangoAudit(p.fechaPreparado));});
    var ms=movs.filter(function(m){return m.usuario_id===u.id&&fechaEnRangoAudit(m.fecha);});
    var gps=gpsPointsFor(u.id);
    var cu={};vs.forEach(function(v){if(v.cliente_id)cu[v.cliente_id]=true;});
    return {u:u,visitas:vs,pedidos:ps,cobros:ms.filter(function(m){return m.tipo==='credito';}),gps:gps,clientes:Object.keys(cu).length};
  }
  var resumenes=preventistas.map(resumenPreventista);

  var selectedGps=[];
  idsSeleccionados.forEach(function(id){selectedGps=selectedGps.concat(gpsPointsFor(id));});
  var tracks=[];
  if(preventistaId!=='todos'){
    var pts=gpsPointsFor(preventistaId);
    if(pts.length>1)tracks.push({points:pts,color:'#E31E24'});
  }else{
    resumenes.forEach(function(r,i){if(r.gps.length>1)tracks.push({points:r.gps,color:['#E31E24','#1F4788','#1a9e5c','#6d3fd6','#e07b10'][i%5]});});
  }
  var markers=visitasDia.filter(function(v){return v.lat&&v.lng;}).map(function(v){
    var obs=String(v.observaciones||'');
    var color=obs.indexOf('SE NEGÓ A PAGAR')>=0?'#E31E24':(obs.indexOf('Pago recibido')>=0?'#1a9e5c':'#1F4788');
    return {lat:v.lat,lng:v.lng,color:color,popup:'<strong>'+clienteName(v)+'</strong><br>'+((v.preventista_nombre)||preventistaNombre(v.preventista_id))+'<br>'+String(v.fecha||'')+'<br>'+obs};
  });

  function visitasSinPedido(){
    var pedidosClientes={};
    pedidosDia.forEach(function(p){if(p.cliente&&p.cliente.id)pedidosClientes[p.cliente.id]=true;});
    return visitasDia.filter(function(v){return v.cliente_id&&!pedidosClientes[v.cliente_id];});
  }
  var sinPedido=visitasSinPedido();

  function exportarAuditoria(){
    var rows=visitasDia.map(function(v){
      return {Fecha:v.fecha,Preventista:v.preventista_nombre||preventistaNombre(v.preventista_id),Cliente:clienteName(v),GPS:(v.lat&&v.lng)?(v.lat+','+v.lng):'',Observaciones:v.observaciones||''};
    });
    var rowsCobros=cobros.map(function(m){return {Fecha:m.fecha,Preventista:m.usuario_nombre||preventistaNombre(m.usuario_id),Cliente:m.cliente_nombre,Monto:m.monto,Forma:m.forma_pago||'',Referencia:m.referencia||'',Observaciones:m.observaciones||''};});
    var rowsEventos=eventosDia.map(function(e){return {Fecha:e.fecha,Hora:e.hora,Preventista:e.usuario_nombre,Tipo:e.tipo,Accion:e.accion,Cliente:e.cliente_nombre||'',Pedido:e.pedido_id||'',Monto:e.monto||'',GPS:e.lat&&e.lng?(e.lat+','+e.lng):e.gps_estado,Estado:e.sync_estado||'',Observaciones:e.observaciones||''};});
    exportXLSX([{name:'Eventos balance',rows:rowsEventos},{name:'Visitas',rows:rows},{name:'Cobros',rows:rowsCobros}], 'Auditoria_Recorridos_'+rangeLabel(fechaDesde,fechaHasta)+'.xlsx');
  }

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🧭 Auditoría de recorridos y cobranzas'),
        E('div',{className:'brow'},
          E('label',{style:{fontSize:12,fontWeight:700}},'Desde ',E('input',{className:'fi sm',type:'date',value:fechaDesde,onChange:function(e){setFechaDesde(e.target.value);},style:{width:150}})),
          E('label',{style:{fontSize:12,fontWeight:700}},'Hasta ',E('input',{className:'fi sm',type:'date',value:fechaHasta,onChange:function(e){setFechaHasta(e.target.value);},style:{width:150}})),
          E('select',{className:'fs',value:preventistaId,onChange:function(e){setPreventistaId(e.target.value);},style:{width:230}},
            E('option',{value:'todos'},'Todos los preventistas'),
            preventistas.map(function(u){return E('option',{key:u.id,value:u.id},u.nombre||u.username);})
          ),
          E('button',{className:'btn',onClick:cargar},'🔄 Actualizar'),
          E('button',{className:'btn ok',onClick:exportarAuditoria},'📤 Exportar')
        )
      ),
      E('div',{className:'alert warn',style:{marginBottom:12}},
        E('span',null,'Las visitas, cobros, negativas, eventos y puntos GPS quedan guardados para balance del recorrido. Ahora podés filtrar por una fecha o por un rango entre fechas.')
      ),
      E('div',{className:'kpi-row'},
        E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Clientes recorridos'),E('div',{className:'kpi-val'},Object.keys(clientesUnicos).length||visitasDia.length)),
        E('div',{className:'kpi'},E('div',{className:'kpi-label'},'Visitas registradas'),E('div',{className:'kpi-val'},visitasDia.length)),
        E('div',{className:'kpi green'},E('div',{className:'kpi-label'},'Cobros recibidos'),E('div',{className:'kpi-val'},'$'+$i(totalCobrado))),
        E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Negativas de pago'),E('div',{className:'kpi-val'},negativas.length)),
        E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pedidos creados'),E('div',{className:'kpi-val'},pedidosCreados)),
        E('div',{className:'kpi purple'},E('div',{className:'kpi-label'},'Entregados / rechazados'),E('div',{className:'kpi-val'},pedidosEntregados+' / '+pedidosRechazados))
      ),
      E('div',{className:'kpi-row'},
        E('div',{className:'kpi teal'},E('div',{className:'kpi-label'},'Eventos balance'),E('div',{className:'kpi-val'},eventosDia.length)),
        E('div',{className:'kpi orange'},E('div',{className:'kpi-label'},'Pedidos / visitas / cobros'),E('div',{className:'kpi-val'},eventosPedido+' / '+eventosVisita+' / '+eventosCobro)),
        E('div',{className:'kpi red'},E('div',{className:'kpi-label'},'Eventos sin GPS'),E('div',{className:'kpi-val'},eventosSinGPS))
      )
    ),

    E('div',{className:'grid2'},
      E('div',{className:'card'},
        E('div',{className:'card-hd'},E('div',{className:'card-title'},'🗺️ Mapa de recorrido, visitas y cobros')),
        (tracks.length||markers.length)?E(LeafletMap,{height:'420px',tracks:tracks,markers:markers,noFit:false}):E('div',{className:'empty'},'No hay puntos GPS ni visitas con ubicación para la fecha seleccionada.')
      ),
      E('div',{className:'card'},
        E('div',{className:'card-hd'},E('div',{className:'card-title'},'📌 Resumen por preventista')),
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Preventista'),E('th',null,'GPS'),E('th',null,'Inicio'),E('th',null,'Fin'),E('th',null,'Km aprox.'),E('th',null,'Visitas'),E('th',null,'Cobros'))),
          E('tbody',null,resumenes.length?resumenes.map(function(r){
            var km=distanciaKm(r.gps);
            var cob=r.cobros.reduce(function(s,m){return s+(parseFloat(m.monto)||0);},0);
            return E('tr',{key:r.u.id},
              E('td',null,E('strong',null,r.u.nombre||r.u.username)),
              E('td',null,r.gps.length+' pts'),
              E('td',null,r.gps.length?horaFromTs(r.gps[0].ts):'—'),
              E('td',null,r.gps.length?horaFromTs(r.gps[r.gps.length-1].ts):'—'),
              E('td',null,km?km.toFixed(1):'—'),
              E('td',null,r.visitas.length),
              E('td',null,'$'+$i(cob))
            );
          }):E('tr',null,E('td',{colSpan:7,className:'empty'},'Sin preventistas cargados.')))
        ))
      )
    ),

    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'🏪 Visitas, cobros y motivos')),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Hora'),E('th',null,'Preventista'),E('th',null,'Cliente'),E('th',null,'Tipo'),E('th',null,'Detalle'),E('th',null,'GPS'))),
        E('tbody',null,visitasDia.length?visitasDia.sort(function(a,b){return String(a.fecha||'').localeCompare(String(b.fecha||''));}).map(function(v){
          var obs=String(v.observaciones||'');
          var tipo=obs.indexOf('SE NEGÓ A PAGAR')>=0?'Negativa':(obs.indexOf('Pago recibido')>=0?'Cobro':'Visita');
          return E('tr',{key:v.id},
            E('td',null,horaSolo(v.fecha)),
            E('td',null,v.preventista_nombre||preventistaNombre(v.preventista_id)),
            E('td',null,clienteName(v)),
            E('td',null,E('span',{className:'badge '+(tipo==='Negativa'?'off':'on')},tipo)),
            E('td',null,obs||'—'),
            E('td',null,(v.lat&&v.lng)?E('a',{href:'https://www.google.com/maps?q='+v.lat+','+v.lng,target:'_blank'},'Abrir mapa'):'—')
          );
        }):E('tr',null,E('td',{colSpan:6,className:'empty'},'No hay visitas registradas.')))
      ))
    ),

    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'🧾 Balance de actividad offline/online')),
      E('div',{className:'alert ok'},E('span',null,'Estos eventos se guardan en el teléfono aunque no haya internet y se sincronizan cuando vuelve la conexión. El GPS acompaña, pero no bloquea el registro.')),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Hora'),E('th',null,'Preventista'),E('th',null,'Tipo'),E('th',null,'Acción'),E('th',null,'Cliente'),E('th',null,'GPS'),E('th',null,'Estado'))),
        E('tbody',null,eventosDia.length?eventosDia.sort(function(a,b){return (a.ts||0)-(b.ts||0);}).map(function(e){return E('tr',{key:e.id},
          E('td',null,e.hora||horaSolo(e.fecha)),
          E('td',null,e.usuario_nombre||preventistaNombre(e.usuario_id)),
          E('td',null,E('span',{className:'badge on'},e.tipo||'evento')),
          E('td',null,e.accion||'—'),
          E('td',null,e.cliente_nombre||'—'),
          E('td',null,(e.lat&&e.lng)?E('a',{href:'https://www.google.com/maps?q='+e.lat+','+e.lng,target:'_blank'},'Abrir mapa'):(e.gps_estado||'sin_gps')),
          E('td',null,e.sync_estado||'sincronizado')
        );}):E('tr',null,E('td',{colSpan:7,className:'empty'},'Todavía no hay eventos de balance para la fecha seleccionada.')))
      ))
    ),

    E('div',{className:'grid2'},
      E('div',{className:'card'},
        E('div',{className:'card-hd'},E('div',{className:'card-title'},'💳 Cobros registrados')),
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Hora'),E('th',null,'Preventista'),E('th',null,'Cliente'),E('th',null,'Monto'),E('th',null,'Forma'))),
          E('tbody',null,cobros.length?cobros.map(function(m){return E('tr',{key:m.id},
            E('td',null,horaSolo(m.fecha)),
            E('td',null,m.usuario_nombre||preventistaNombre(m.usuario_id)),
            E('td',null,m.cliente_nombre||'—'),
            E('td',null,E('strong',null,'$'+$(m.monto))),
            E('td',null,m.forma_pago||'—')
          );}):E('tr',null,E('td',{colSpan:5,className:'empty'},'Sin cobros registrados.')))
        ))
      ),
      E('div',{className:'card'},
        E('div',{className:'card-hd'},E('div',{className:'card-title'},'⚠️ Visitas sin pedido / sin compra')),
        E('div',{className:'tw'},E('table',null,
          E('thead',null,E('tr',null,E('th',null,'Cliente'),E('th',null,'Preventista'),E('th',null,'Hora'),E('th',null,'Observación'))),
          E('tbody',null,sinPedido.length?sinPedido.map(function(v){return E('tr',{key:v.id},
            E('td',null,clienteName(v)),
            E('td',null,v.preventista_nombre||preventistaNombre(v.preventista_id)),
            E('td',null,horaSolo(v.fecha)),
            E('td',null,v.observaciones||'—')
          );}):E('tr',null,E('td',{colSpan:4,className:'empty'},'No hay visitas sin pedido para esta fecha.')))
        ))
      )
    )
  );
}



// Funciones restauradas V49 para evitar pantalla en blanco
function BottomNav(props){
  var user=props.user;
  var mod=props.mod;
  var setMod=props.setMod;
  var isPrev=user.role==='preventista';
  var isPrep=user.role==='preparador';
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var pedidos=gl('pedidos',[]);
  var pendCount=pedidos.filter(function(p){return p.estado==='pendiente';}).length;
  var readyCount=pedidos.filter(function(p){return p.estado==='preparado'&&p.preventistaId===user.id;}).length;

  function item(id,icon,label,badge){
    return E('button',{key:id,className:'bn-item'+(mod===id?' on':''),onClick:function(){setMod(id);}},
      badge>0&&E('span',{className:'bn-dot'}),
      E('span',{className:'bn-icon'},icon),
      E('span',null,label)
    );
  }

  if(isPrev) return E('div',{className:'bottom-nav'},
    item('dashboard','📊','Inicio'),
    item('nuevo-pedido','🛒','Pedido'),
    item('ofertas','🔥','Ofertas Relámpago'),
    item('mis-pedidos','📦','Mis Pedidos',readyCount),
    item('clientes','👥','Clientes'),
    item('cuentas-corrientes','💳','CC'),
    item('mapa-gps','🗺️','GPS')
  );

  if(isPrep) return E('div',{className:'bottom-nav'},
    item('dashboard','📊','Inicio'),
    item('cola-prep','⚙️','Preparar',pendCount),
    item('todos-pedidos','📋','Pedidos'),
    item('articulos','📦','Artículos')
  );

  if(isAdminOrCo) return E('div',{className:'bottom-nav'},
    item('dashboard','📊','Inicio'),
    item('nuevo-pedido','🛒','Pedido'),
    item('cola-prep','⚙️','Preparar',pendCount),
    item('todos-pedidos','📋','Pedidos'),
    item('clientes','👥','Clientes'),
    item('cuentas-corrientes','💳','CC'),
    item('ofertas','🔥','Ofertas Relámpago'),
    item('mapa-admin','🗺️','GPS'),
    item('auditoria','🧭','Auditoría')
  );

  return null;
}

function ObjetivosPreventistas(props){
  var user=props.user;
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var _u=useState([]),usuarios=_u[0],setUsuarios=_u[1];
  var _o=useState([]),objetivos=_o[0],setObjetivos=_o[1];
  var _msg=useState(null),msg=_msg[0],setMsg=_msg[1];
  var hoy=(new Date()).toISOString().slice(0,10);
  var _f=useState({usuarioId:'',fechaDesde:hoy,fechaHasta:hoy,objetivoVisitas:20,objetivoPedidos:8,objetivoVentas:0,objetivoCobranza:0}),form=_f[0],setForm=_f[1];

  if(!isAdminOrCo)return E('div',{className:'empty'},'Módulo disponible solo para Administrador o Co-Administrador.');

  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},3500);}
  function cargar(){
    dbGet('usuarios').then(function(rows){
      var us=(Array.isArray(rows)?rows:[]).map(dbToUser).filter(function(u){return u.role==='preventista'&&u.activo!==false;});
      setUsuarios(us);
      if(!form.usuarioId&&us[0])setForm(Object.assign({},form,{usuarioId:us[0].id}));
    }).catch(function(){});
    dbGet('objetivos_preventistas').then(function(rows){if(Array.isArray(rows))setObjetivos(rows.map(dbToObj));}).catch(function(){});
  }
  useEffect(function(){cargar();},[]);
  function set(k,v){setForm(Object.assign({},form,{[k]:v}));}
  function userName(id){var u=usuarios.find(function(x){return x.id===id;});return u?(u.nombre||u.username):id;}

  function guardar(){
    if(!form.usuarioId){flash('err','Seleccioná un preventista.');return;}
    if(!form.fechaDesde||!form.fechaHasta){flash('err','Completá fecha desde y hasta.');return;}
    if(form.fechaHasta<form.fechaDesde){flash('err','La fecha hasta no puede ser menor que desde.');return;}
    var id='obj_'+form.usuarioId+'_'+form.fechaDesde+'_'+form.fechaHasta;
    var row=objToDb(Object.assign({},form,{id:id,usuarioNombre:userName(form.usuarioId),activo:true}));
    dbUpsert('objetivos_preventistas',row).then(function(){flash('ok','Objetivo guardado.');cargar();})
      .catch(function(e){flash('err','No se pudo guardar: '+e.message);});
  }
  function desactivar(o){
    if(!confirm('¿Desactivar objetivo de '+(o.usuarioNombre||userName(o.usuarioId))+'?'))return;
    dbUpdate('objetivos_preventistas',o.id,{activo:false}).then(function(){flash('ok','Objetivo desactivado.');cargar();})
      .catch(function(){flash('err','No se pudo desactivar.');});
  }
  var activos=objetivos.filter(function(o){return o.activo!==false;}).sort(function(a,b){return String(b.fechaDesde).localeCompare(String(a.fechaDesde));});

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'🎯 Objetivos simples para preventistas'),
        E('button',{className:'btn',onClick:cargar},'🔄 Actualizar')
      ),
      E('div',{className:'alert warn'},E('span',null,'Versión simple: cargá metas por período para visitas, pedidos, ventas y cobranza. El preventista las ve en su Dashboard.')),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Preventista'),
          E('select',{className:'fs',value:form.usuarioId,onChange:function(e){set('usuarioId',e.target.value);}},
            E('option',{value:''},'Seleccionar preventista'),
            usuarios.map(function(u){return E('option',{key:u.id,value:u.id},u.nombre||u.username);})
          )
        ),
        E('div',{className:'fg'},E('label',null,'Objetivo de visitas'),E('input',{className:'fi',type:'number',min:0,value:form.objetivoVisitas,onChange:function(e){set('objetivoVisitas',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Desde'),E('input',{className:'fi',type:'date',value:form.fechaDesde,onChange:function(e){set('fechaDesde',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Hasta'),E('input',{className:'fi',type:'date',value:form.fechaHasta,onChange:function(e){set('fechaHasta',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Objetivo de pedidos'),E('input',{className:'fi',type:'number',min:0,value:form.objetivoPedidos,onChange:function(e){set('objetivoPedidos',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Objetivo de ventas $'),E('input',{className:'fi',type:'number',min:0,value:form.objetivoVentas,onChange:function(e){set('objetivoVentas',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Objetivo de cobranza $'),E('input',{className:'fi',type:'number',min:0,value:form.objetivoCobranza,onChange:function(e){set('objetivoCobranza',e.target.value);}}))
      ),
      E('button',{className:'btn pri',onClick:guardar},'💾 Guardar objetivo')
    ),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},E('div',{className:'card-title'},'📋 Objetivos activos')),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Preventista'),E('th',null,'Período'),E('th',null,'Visitas'),E('th',null,'Pedidos'),E('th',null,'Ventas'),E('th',null,'Cobranza'),E('th',null,'Acción'))),
        E('tbody',null,activos.length?activos.map(function(o){return E('tr',{key:o.id},
          E('td',null,o.usuarioNombre||userName(o.usuarioId)),
          E('td',null,o.fechaDesde+' → '+o.fechaHasta),
          E('td',null,o.objetivoVisitas),
          E('td',null,o.objetivoPedidos),
          E('td',null,'$'+$i(o.objetivoVentas)),
          E('td',null,'$'+$i(o.objetivoCobranza)),
          E('td',null,E('button',{className:'btn sm dan',onClick:function(){desactivar(o);}},'Desactivar'))
        );}):E('tr',null,E('td',{colSpan:7,className:'empty'},'Todavía no hay objetivos cargados.')))
      ))
    )
  );
}

function Usuarios(props){
  var currentUser=(props&&props.user)||getAdmin();
  var isAdmin=currentUser.role==='admin';
  var _a=useState([]),users=_a[0],setUsers=_a[1];
  var _b=useState(null),modal=_b[0],setModal=_b[1];
  var emptyForm={nombre:'',username:'',email:'',authUserId:'',role:'preventista',activo:true,permisos:{max_desc:5,desc_deshabilitado:false}};
  var _c=useState(emptyForm),form=_c[0],setForm=_c[1];
  var _d=useState(null),msg=_d[0],setMsg=_d[1];

  useEffect(function(){reload();},[]);
  function reload(){dbGet('usuarios').then(function(rows){if(rows)setUsers(rows.map(dbToUser));});}
  function F(k,v){setForm(function(f){return Object.assign({},f,{[k]:v});});}
  function FPerm(k,v){setForm(function(f){return Object.assign({},f,{permisos:Object.assign({},f.permisos||{},{[k]:v})});});}
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},4000);}

  function handleSave(){
    if(!form.nombre.trim()||!form.username.trim()){flash('err','Nombre y usuario son obligatorios.');return;}
    if(!isAdmin&&form.role==='admin'){flash('err','Solo el Administrador puede crear o editar usuarios administradores.');return;}
    var others=users.filter(function(u){return u.id!==form.id;});
    if(others.find(function(u){return String(u.username||'').toUpperCase()===String(form.username||'').toUpperCase();})){flash('err','Nombre de usuario ya existe.');return;}
    var perms=Object.assign({},form.permisos||{});
    perms.max_desc=Math.min(10,Math.max(0,parseFloat(perms.max_desc)||0));
    perms.desc_deshabilitado=!!perms.desc_deshabilitado;
    var row=userToDb(Object.assign({},form,{id:form.id||uid(),authUserId:form.authUserId||null,email:form.email||authEmailFromUsername(form.username),permisos:perms}));
    dbUpsert('usuarios',row).then(function(){reload();setModal(null);flash('ok','Perfil guardado. Recordá crear/vincular el usuario en Supabase Auth para que pueda ingresar.');})
      .catch(function(e){flash('err','No se pudo guardar: '+(e.message||e));});
  }

  return E('div',null,
    E('div',{className:'card'},
      E('div',{className:'card-title'},'🔐 Usuarios con Supabase Auth'),
      E('div',{className:'alert warn',style:{fontSize:12,marginTop:12}},
        E('span',null,E('strong',null,'Seguridad: '),'las contraseñas ya no se guardan en esta app. Primero creá el usuario en Supabase → Authentication → Users. Después vinculalo acá con el email o auth_user_id.')
      )
    ),
    E('div',{className:'card'},
      E('div',{className:'card-hd'},
        E('div',{className:'card-title'},'👤 Usuarios del Sistema'),
        E('button',{className:'btn pri',onClick:function(){setForm(emptyForm);setModal('new');}},'+ Nuevo perfil')
      ),
      msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Nombre'),E('th',null,'Usuario'),E('th',null,'Email/Auth'),E('th',null,'Rol'),E('th',null,'Estado'),E('th',null,'Desc. máx'),E('th',null,'Acciones'))),
        E('tbody',null,users.map(function(u){
          return E('tr',{key:u.id},
            E('td',null,E('strong',null,u.nombre)),
            E('td',null,u.username),
            E('td',null,E('div',{style:{fontSize:12,color:'var(--txt2)'}},u.email||'—',u.authUserId?E('div',null,'Auth vinculado'):E('div',{style:{color:'var(--orange)'}},'Falta auth_user_id'))),
            E('td',null,E('span',{className:'badge '+u.role},roleLabel(u.role))),
            E('td',null,E('span',{className:'badge '+(u.activo?'on':'off')},u.activo?'Activo':'Inactivo')),
            E('td',null,(getMaxDesc(u.id,u)+'%')),
            E('td',null,E('div',{className:'brow'},
              E('button',{className:'btn sm',onClick:function(){setForm(Object.assign({},u,{permisos:Object.assign({max_desc:5,desc_deshabilitado:false},u.permisos||{})}));setModal('edit');}},'✏️'),
              E('button',{className:'btn sm '+(u.activo?'warn':'ok'),onClick:function(){
                if(u.id===currentUser.id){flash('err','No podés desactivar tu propio usuario.');return;}
                dbUpdate('usuarios',u.id,{activo:!u.activo}).then(function(){reload();});
              }},u.activo?'🔴 Desactivar':'🟢 Activar'),
              isAdmin&&E('button',{className:'btn sm dan',onClick:function(){
                if(u.id===currentUser.id){flash('err','No podés eliminar tu propio usuario.');return;}
                if(confirm('¿Eliminar el perfil de '+u.nombre+'? Esto NO borra el usuario de Supabase Auth.'))dbDelete('usuarios',u.id).then(function(){reload();});
              }},'Eliminar')
            ))
          );
        }))
      ))
    ),
    modal&&E(Modal,{title:modal==='new'?'Nuevo Perfil de Usuario':'Editar Perfil de Usuario',onClose:function(){setModal(null);}},
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Nombre ',E('em',null,'*')),E('input',{className:'fi',value:form.nombre,onChange:function(e){F('nombre',e.target.value);}})),
        E('div',{className:'fg'},E('label',null,'Usuario ',E('em',null,'*')),E('input',{className:'fi',value:form.username,onChange:function(e){F('username',e.target.value);},autoCapitalize:'none'}))
      ),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Email de login'),E('input',{className:'fi',value:form.email||authEmailFromUsername(form.username),onChange:function(e){F('email',e.target.value);},placeholder:'usuario@alista.internal'})),
        E('div',{className:'fg'},E('label',null,'Auth User ID'),E('input',{className:'fi',value:form.authUserId||'',onChange:function(e){F('authUserId',e.target.value);},placeholder:'UUID de Supabase Auth'}))
      ),
      E('div',{className:'alert warn',style:{fontSize:12}},
        E('span',null,'La contraseña se crea o cambia desde Supabase → Authentication → Users. No se guarda en el HTML ni en la tabla usuarios.')
      ),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Rol'),
          E('select',{className:'fs',value:form.role,onChange:function(e){F('role',e.target.value);}},
            E('option',{value:'preventista'},'Preventista'),
            E('option',{value:'preparador'},'Preparador'),
            E('option',{value:'coadmin'},'Co-Administrador'),
            isAdmin&&E('option',{value:'admin'},'Administrador')
          )
        ),
        E('div',{className:'fg'},E('label',null,'Estado'),
          E('select',{className:'fs',value:form.activo?'1':'0',onChange:function(e){F('activo',e.target.value==='1');}},
            E('option',{value:'1'},'Activo'),E('option',{value:'0'},'Inactivo')
          )
        )
      ),
      E('div',{className:'grid2'},
        E('div',{className:'fg'},E('label',null,'Descuento máximo permitido (%)'),
          E('input',{className:'fi',type:'number',min:0,max:10,step:0.5,value:(form.permisos&&form.permisos.max_desc!==undefined)?form.permisos.max_desc:5,
            onChange:function(e){FPerm('max_desc',Math.min(10,Math.max(0,parseFloat(e.target.value)||0)));}}),
          E('div',{style:{fontSize:11,color:'var(--txt2)',marginTop:4}},'Máximo del sistema: 10%. Además no permite vender por debajo del costo.')
        ),
        E('div',{className:'fg'},E('label',null,'Estado del descuento'),
          E('select',{className:'fs',value:(form.permisos&&form.permisos.desc_deshabilitado)?'0':'1',onChange:function(e){FPerm('desc_deshabilitado',e.target.value==='0');}},
            E('option',{value:'1'},'Habilitado'),E('option',{value:'0'},'Deshabilitado')
          )
        )
      ),
      E('div',{className:'brow',style:{marginTop:18}},
        E('button',{className:'btn pri',onClick:handleSave,style:{flex:1}},'Guardar perfil'),
        E('button',{className:'btn',onClick:function(){setModal(null);},style:{flex:1}},'Cancelar')
      )
    )
  );
}

function Configuracion(){
  var _a=useState(gl('cfg',{descGlobal:5,descXUser:{}})),cfg=_a[0],setCfg=_a[1];
  var _b=useState(null),msg=_b[0],setMsg=_b[1];
  var _u=useState([]),users=_u[0],setUsers=_u[1];

  useEffect(function(){dbGet('usuarios').then(function(rows){if(rows)setUsers(rows.map(dbToUser));});},[]);

  function saveCfg(c){setCfg(c);sl('cfg',c);}
  function flash(t,m){setMsg({t:t,m:m});setTimeout(function(){setMsg(null);},3000);}
  function setDescGlobal(v){saveCfg(Object.assign({},cfg,{descGlobal:Math.min(10,Math.max(0,parseFloat(v)||0))}));}
  function setUserDesc(uid,field,val){
    var dx=Object.assign({},cfg.descXUser||{});dx[uid]=Object.assign({},dx[uid]||{});
    dx[uid][field]=field==='deshabilitado'?val:parseFloat(val)||0;
    saveCfg(Object.assign({},cfg,{descXUser:dx}));
  }

  function setUserPerm(u,key,val){
    var perms=Object.assign({},u.permisos||{});perms[key]=val;
    dbUpdate('usuarios',u.id,{permisos:perms}).then(function(){
      setUsers(function(prev){return prev.map(function(x){return x.id===u.id?Object.assign({},x,{permisos:perms}):x;});});
    });
  }

  function doBackup(){
    exportXLSX([
      {name:'Artículos',rows:gl('arts',[]).map(function(a){return{'Código':a.cod,'Descripción':a.desc,'Precio de Costo':a.costo||0,'Precio al Público':a.precio,'Estado':a.estado};})},
      {name:'Pedidos',rows:gl('pedidos',[]).map(function(p){return{'N°':p.nPedido,'Fecha':p.fecha,'Estado':estadoLabel(p.estado),'Preventista':p.preventistaNombre,'Cliente':p.cliente.nombre+' '+p.cliente.apellido,'Total':p.total,'Pago':p.formaPago||''};})},
      {name:'Usuarios',rows:users.map(function(u){return{'Nombre':u.nombre,'Usuario':u.username,'Rol':roleLabel(u.role),'Activo':u.activo?'Sí':'No'};})},
    ],'backup_alista_'+todayStr().replace(/\//g,'-')+'.xlsx');
    flash('ok','Respaldo exportado.');
  }

  var nonAdmin=users.filter(function(u){return u.role!=='admin';});

  return E('div',null,
    msg&&E(Alert,{t:msg.t,msg:msg.m,onClose:function(){setMsg(null);}}),
    E('div',{className:'card',style:{maxWidth:560}},
      E('div',{className:'card-title'},'⚙️ Configuración General'),
      E('div',{className:'fg'},
        E('label',null,'Descuento Máximo Global (%)'),
        E('input',{className:'fi',type:'number',min:0,max:10,step:0.5,value:cfg.descGlobal,onChange:function(e){setDescGlobal(e.target.value);},style:{maxWidth:160}}),
        E('div',{style:{fontSize:12,color:'var(--txt2)',marginTop:4}},'Máximo del sistema: 10%. Aplica salvo que tengan configuración individual.')
      )
    ),

    nonAdmin.length>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'🔑 Permisos por Usuario'),
      E('div',{style:{fontSize:12,color:'var(--txt2)',marginBottom:12}},'El Administrador tiene acceso completo siempre. Configurá los permisos para el resto.'),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,
          E('th',null,'Usuario'),E('th',null,'Rol'),
          E('th',null,'Clientes'),E('th',null,'Ver Saldo CC'),E('th',null,'Registrar Pagos CC')
        )),
        E('tbody',null,nonAdmin.map(function(u){
          var p=u.permisos||{};
          var defaultPerm=u.role==='coadmin'?'full':u.role==='preventista'?'read':'none';
          var cli=p.clientes||defaultPerm;
          return E('tr',{key:u.id},
            E('td',null,E('strong',null,u.nombre),E('div',{style:{fontSize:11,color:'var(--txt2)'}},u.username)),
            E('td',null,E('span',{className:'badge '+u.role},roleLabel(u.role))),
            E('td',null,E('select',{
              value:cli,
              onChange:function(e){setUserPerm(u,'clientes',e.target.value);},
              style:{padding:'6px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontFamily:'inherit',fontSize:13}},
              E('option',{value:'none'},'Sin acceso'),
              E('option',{value:'read'},'Solo lectura'),
              E('option',{value:'full'},'Acceso completo')
            )),
            E('td',null,E('label',{style:{display:'flex',alignItems:'center',gap:6,cursor:'pointer',justifyContent:'center'}},
              E('input',{type:'checkbox',
                checked:u.role==='coadmin'?true:(p.cc_ver_saldo||false),
                disabled:u.role==='coadmin',
                onChange:function(e){setUserPerm(u,'cc_ver_saldo',e.target.checked);}})
            )),
            E('td',null,E('label',{style:{display:'flex',alignItems:'center',gap:6,cursor:'pointer',justifyContent:'center'}},
              E('input',{type:'checkbox',
                checked:u.role==='coadmin'?true:(p.cc_registrar_pago||false),
                disabled:u.role==='coadmin',
                onChange:function(e){setUserPerm(u,'cc_registrar_pago',e.target.checked);}})
            ))
          );
        }))
      ))
    ),

    nonAdmin.filter(function(u){return u.role==='preventista'||u.role==='coadmin';}).length>0&&E('div',{className:'card'},
      E('div',{className:'card-title'},'👤 Descuento por Preventista'),
      E('div',{className:'tw'},E('table',null,
        E('thead',null,E('tr',null,E('th',null,'Usuario'),E('th',null,'Rol'),E('th',null,'% Descuento'),E('th',null,'Estado'))),
        E('tbody',null,nonAdmin.filter(function(u){return u.role==='preventista'||u.role==='coadmin';}).map(function(u){
          var ux=(cfg.descXUser||{})[u.id]||{};
          return E('tr',{key:u.id},
            E('td',null,E('strong',null,u.nombre)),
            E('td',null,E('span',{className:'badge '+u.role},roleLabel(u.role))),
            E('td',null,E('div',{style:{display:'flex',alignItems:'center',gap:8}},
              E('input',{type:'number',min:0,max:10,step:0.5,value:typeof ux.max==='number'?ux.max:'',
                placeholder:'Global ('+cfg.descGlobal+'%)',
                onChange:function(e){setUserDesc(u.id,'max',e.target.value);},
                style:{width:110,padding:'5px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontFamily:'inherit'}}),'%'
            )),
            E('td',null,E('label',{style:{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}},
              E('input',{type:'checkbox',checked:!ux.deshabilitado,onChange:function(e){setUserDesc(u.id,'deshabilitado',!e.target.checked);}}),
              ux.deshabilitado?'Deshabilitado':'Habilitado'
            ))
          );
        }))
      ))
    ),

    E('div',{className:'card',style:{maxWidth:560}},
      E('div',{className:'card-title'},'💾 Respaldo de Datos'),
      E('p',{style:{fontSize:13,color:'var(--txt2)',marginBottom:14}},'Exporta artículos, pedidos y usuarios en un archivo Excel.'),
      E('button',{className:'btn pri',onClick:doBackup},'📥 Exportar Respaldo Completo')
    )
  );
}

var MOD_TITLES={
  'dashboard':'Dashboard','nuevo-pedido':'Nuevo Pedido','mis-pedidos':'Mis Pedidos',
  'mapa-gps':'Mi Recorrido GPS','jornada-caja':'Jornada / Caja','cola-prep':'Cola de Preparación',
  'todos-pedidos':'Todos los Pedidos','mapa-admin':'Mapa de Preventistas','auditoria':'Auditoría Recorridos','objetivos':'Objetivos Preventistas','ofertas':'Ofertas Relámpago',
  'clientes':'Clientes','articulos':'Artículos','cuentas-corrientes':'Cuentas Corrientes',
  'estadisticas':'Estadísticas','comisiones':'Comisiones','usuarios':'Usuarios','configuracion':'Configuración'
};

function App(){
  var _a=useState(null),user=_a[0],setUser=_a[1];
  var _b=useState('dashboard'),mod=_b[0],setMod=_b[1];
  var _c=useState(false),sbOpen=_c[0],setSbOpen=_c[1];
  var _auth=useState(false),authChecked=_auth[0],setAuthChecked=_auth[1];

  useEffect(function(){
    authRestore().then(function(profile){if(profile)setUser(profile);setAuthChecked(true);});
  },[]);
  useEffect(function(){if(user){boot();auditEnsureSyncLoop(user);auditRecord(user,'sistema','Inicio de sesión / sesión activa',{resultado:navigator.onLine?'online':'offline'});auditSyncPending();}},[user&&user.id]);

  if(!authChecked)return E('div',{className:'login-bg'},E('div',{className:'login-box'},E('div',{className:'login-brand-name'},E('em',null,'ALISTA '),'AHORRO'),E('div',{style:{marginTop:16,color:'var(--txt2)'}},'Verificando sesión segura…')));
  if(!user)return E(Login,{onLogin:setUser});

  var isAdmin=user.role==='admin';
  var isAdminOrCo=user.role==='admin'||user.role==='coadmin';
  var isPrev=user.role==='preventista';
  var isPrep=user.role==='preparador';

  function goMod(m){setMod(m);setSbOpen(false);}

  function renderMod(){
    if(mod==='dashboard')return E(Dashboard,{user:user});
    if(mod==='nuevo-pedido'&&(isPrev||isAdminOrCo))return E(NuevoPedido,{user:user});
    if(mod==='mis-pedidos'&&isPrev)return E(MisPedidos,{user:user});
    if(mod==='jornada-caja'&&(isPrev||isAdminOrCo))return E(JornadaCaja,{user:user});
    if(mod==='mapa-gps'&&isPrev)return E(MapaGPS,{user:user});
    if(mod==='cola-prep'&&(isAdminOrCo||isPrep))return E(ColaPreparacion,{user:user});
    if(mod==='todos-pedidos'&&(isAdminOrCo||isPrep))return E(TodosPedidos,{user:user,setMod:goMod});
    if(mod==='mapa-admin'&&isAdminOrCo)return E(MapaAdmin,null);
    if(mod==='auditoria'&&isAdminOrCo)return E(AuditoriaRecorridos,{user:user});
    if(mod==='objetivos'&&isAdminOrCo)return E(ObjetivosPreventistas,{user:user});
    if(mod==='ofertas'&&(isPrev||isAdminOrCo))return E(OfertasPreventistas,{user:user});
    if(mod==='clientes')return E(Clientes,{user:user});
    if(mod==='articulos')return E(Articulos,{user:user});
    if(mod==='cuentas-corrientes'&&(isAdminOrCo||isPrev))return E(CuentasCorrientes,{user:user});
    if(mod==='estadisticas'&&isAdminOrCo)return E(Estadisticas,null);
    if(mod==='comisiones'&&isAdminOrCo)return E(Comisiones,null);
    if(mod==='usuarios'&&isAdminOrCo)return E(Usuarios,{setUser:setUser,user:user});
    if(mod==='configuracion'&&isAdminOrCo)return E(Configuracion,null);
    return E('div',{className:'empty'},'Módulo no disponible para tu rol.');
  }

  return E('div',{className:'app'},
    sbOpen&&E('div',{className:'sb-overlay open',onClick:function(){setSbOpen(false);}}),
    E(Sidebar,{user:user,mod:mod,setMod:goMod,isOpen:sbOpen,
      onLogout:function(){authLogout();setUser(null);setMod('dashboard');setSbOpen(false);}}),
    E('div',{className:'main'},
      E('div',{className:'topbar'},
        E('div',{style:{display:'flex',alignItems:'center',gap:8}},
          E('button',{className:'hamburger',onClick:function(){setSbOpen(!sbOpen);}},'☰'),
          E('div',{className:'topbar-title'},MOD_TITLES[mod]||mod)
        ),
        E('div',{className:'topbar-right'},
          E('button',{
            onClick:function(){setSbOpen(!sbOpen);},
            style:{background:'none',border:'none',cursor:'pointer',fontSize:13,
              color:'var(--blue)',fontWeight:700,padding:'6px 10px',
              display:'flex',alignItems:'center',gap:4}
          },'⚙️ Más'),
          E('button',{
            onClick:function(){setUser(null);setMod('dashboard');setSbOpen(false);},
            style:{background:'none',border:'none',cursor:'pointer',fontSize:13,
              color:'var(--txt2)',padding:'6px 8px'}
          },'Salir')
        )
      ),
      E('div',{className:'page'},renderMod()),
      E(BottomNav,{user:user,mod:mod,setMod:goMod})
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(E(App));
