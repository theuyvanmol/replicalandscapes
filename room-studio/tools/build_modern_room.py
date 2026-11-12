import bpy,math,random,pathlib,json
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'dist/real-assets';random.seed(29)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=128;scene.cycles.use_denoising=False
scene.cycles.max_bounces=8;scene.cycles.diffuse_bounces=4;scene.cycles.transparent_max_bounces=8
scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
world=bpy.data.worlds.new('Soft daylight environment');world.use_nodes=True;scene.world=world
wn=world.node_tree.nodes;wn.clear();tex=wn.new('ShaderNodeTexEnvironment');tex.image=bpy.data.images.load(str(OUT/'studio.hdr'));back=wn.new('ShaderNodeBackground');back.inputs['Strength'].default_value=.32;wo=wn.new('ShaderNodeOutputWorld');world.node_tree.links.new(tex.outputs['Color'],back.inputs[0]);world.node_tree.links.new(back.outputs[0],wo.inputs[0])
def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
def pbr(slug,name,color=(1,1,1),rough=.7):
 m=mat(name,color,rough);nt=m.node_tree;p=nt.nodes.get('Principled BSDF')
 for kind,socket in [('diff','Base Color'),('rough','Roughness'),('nor_gl','Normal')]:
  path=OUT/'textures'/(slug+'_'+kind+'.jpg')
  if not path.exists():continue
  node=nt.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(path))
  if kind!='diff':node.image.colorspace_settings.name='Non-Color'
  if kind=='nor_gl':
   normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.35;nt.links.new(node.outputs['Color'],normal.inputs['Color']);nt.links.new(normal.outputs[0],p.inputs[socket])
  else:nt.links.new(node.outputs['Color'],p.inputs[socket])
 return m
plaster=mat('Warm mineral plaster',(.72,.67,.57),.93);trim=mat('Painted warm-white joinery',(.83,.81,.74),.55);oak=pbr('wood_floor','Natural oak floor');linen=pbr('cotton_jersey','Woven ivory textile');stone=mat('Honed limestone',(.55,.49,.39),.65);brass=mat('Aged brass',(.4,.28,.12),.38,.72);dark=mat('Smoked walnut',(.095,.055,.027),.48);paper=mat('Book cover',(.43,.4,.31),.85)
def cube(name,loc,scale,m,bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if m:o.data.materials.append(m)
 if bevel:
  b=o.modifiers.new('Soft manufactured edges','BEVEL');b.width=bevel;b.segments=4
  o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o
def uvscale(o,scale):
 if o.data.uv_layers:
  for uv in o.data.uv_layers.active.data:uv.uv*=scale
 return o
def cyl(name,loc,r,depth,m,r2=None):
 bpy.ops.mesh.primitive_cone_add(vertices=64,radius1=r,radius2=r if r2 is None else r2,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(m);b=o.modifiers.new('Fine edge radius','BEVEL');b.width=.007;b.segments=3
 for p in o.data.polygons:p.use_smooth=True
 return o
# True three-dimensional room shell; the window is an opening, not a room photograph.
uvscale(cube('floor',(0,0,-.055),(7.5,8,.1),oak,.006),4)
cube('wall_back',(0,3.45,1.7),(7.5,.12,3.4),plaster,.012)
cube('wall_left',(-3.7,0,1.7),(.12,6.9,3.4),plaster,.012)
# Right wall contains a tall window opening from y=-.8 to 2.5.
cube('wall_right_front',(3.7,-2.4,1.7),(.12,3.2,3.4),plaster,.01)
cube('wall_right_back',(3.7,2.95,1.7),(.12,1,3.4),plaster,.01)
cube('wall_right_sill',(3.7,.85,.18),(.12,3.3,.36),plaster,.01)
cube('wall_right_header',(3.7,.85,3.27),(.12,3.3,.26),plaster,.01)
for y in [-.8,.3,1.4,2.5]:cube('Window mullion',(3.66,y,1.77),(.12,.055,2.8),trim,.008)
for z in [.38,1.75,3.14]:cube('Window transom',(3.66,.85,z),(.12,3.35,.06),trim,.008)
cube('Window stone sill',(3.56,.85,.38),(.36,3.55,.065),stone,.012)
for loc,dim in [((0,3.35,.07),(7.35,.045,.14)),((-3.6,0,.07),(.045,6.9,.14))]:cube('Skirting',loc,dim,trim,.008)
# Contemporary upholstered sofa, layered seat cushions, piping and soft scatter cushions.
sofaFabric=pbr('cotton_jersey','Natural ivory boucle')
sofaDark=mat('Sofa recessed feet',(.045,.035,.025),.65)
for x in [-2.65,-.35]:
 for y in [1.93,2.79]:cyl('Recessed sofa foot',(x,y,.09),.055,.18,sofaDark)
uvscale(cube('Upholstered sofa platform',(-1.5,2.36,.29),(3.1,1.12,.37),sofaFabric,.16),5)
uvscale(cube('Soft continuous back',(-1.5,2.81,.72),(3.08,.26,.91),sofaFabric,.12),5)
for x in [-2.94,-.06]:uvscale(cube('Rounded sofa arm',(x,2.35,.56),(.28,1.12,.7),sofaFabric,.135),4)
for k in range(3):
 x=-2.4+k*.9
 uvscale(cube('Soft seat cushion',(x,2.3,.53),(.87,.88,.23),sofaFabric,.105),4)
 o=uvscale(cube('Loose back cushion',(x,2.65,.89),(.88,.22,.59),sofaFabric,.10),4);o.rotation_euler.x=-.08
# Soft seam piping follows the cushion perimeter.
for k in range(3):
 x=-2.4+k*.9;curve=bpy.data.curves.new('Seat piping','CURVE');curve.dimensions='3D';curve.bevel_depth=.004;curve.bevel_resolution=2
 spline=curve.splines.new('POLY');points=[]
 for cx,cy,start in [(x+.31,2.3+.31,0),(x-.31,2.3+.31,90),(x-.31,2.3-.31,180),(x+.31,2.3-.31,270)]:
  for j in range(9):
   a=math.radians(start+j*90/8);points.append((cx+.10*math.cos(a),cy+.10*math.sin(a),.56))
 spline.points.add(len(points)-1)
 for point,co in zip(spline.points,points):point.co=(*co,1)
 spline.use_cyclic_u=True;o=bpy.data.objects.new('Fine cushion seam',curve);scene.collection.objects.link(o);o.data.materials.append(trim)
oliveFabric=mat('Olive woven cushion',(.19,.22,.13),.95)
for x,angle in [(-2.58,-.18),(-.45,.24)]:
 o=cube('Soft scatter cushion',(x,2.43,.88),(.46,.19,.46),oliveFabric,.085);o.rotation_euler=(.17,angle,angle)
# Walnut console, large framed artwork and considered architectural detail.
cube('Low oak sideboard',(1.45,3.05,.36),(1.5,.55,.65),dark,.025)
for x in [.77,1.12,1.47,1.82,2.17]:cube('Sideboard relief',(x,2.76,.37),(.012,.016,.56),brass,.003)
for i in range(22):cube('Oak architectural slat',(-3.43+i*.073,3.36,1.63),(.038,.055,3.10),dark,.006)
# Linen rug with a shallow woven edge.
rug=uvscale(cube('Wool rug',(-.65,.1,.008),(3.8,2.7,.018),linen,.022),14)
# Two overlapping low stone tables with fluted cylindrical bases.
cyl('Table base',(-.95,.45,.19),.26,.36,stone)
cyl('Table top',(-.95,.45,.4),.67,.085,stone)
cyl('Small table base',(-.1,.03,.14),.19,.25,stone)
cyl('Small table top',(-.1,.03,.3),.43,.065,stone)
book=cube('Hardback volume',(-1.12,.41,.475),(.35,.27,.045),paper,.009);book.rotation_euler.z=.2
book2=cube('Linen volume',(-1.13,.41,.512),(.32,.24,.03),trim,.006);book2.rotation_euler.z=.14
# Sculptural ceramic bowl.
profile=[(.0,0),(.035,0),(.08,.015),(.13,.055),(.15,.085),(.147,.095),(.13,.07),(.075,.032),(.03,.02),(.0,.02)]
verts=[];faces=[]
for i in range(64):
 a=i*math.tau/64
 for r,z in profile:verts.append((r*math.cos(a),r*math.sin(a),z))
for i in range(64):
 for j in range(len(profile)-1):faces.append((i*len(profile)+j,((i+1)%64)*len(profile)+j,((i+1)%64)*len(profile)+j+1,i*len(profile)+j+1))
me=bpy.data.meshes.new('Ceramic profile');me.from_pydata(verts,[],faces);o=bpy.data.objects.new('Hand-thrown bowl',me);scene.collection.objects.link(o);o.location=(-.62,.5,.443);o.data.materials.append(stone)
for poly in me.polygons:poly.use_smooth=True
# Large recessed framed abstract, geometric relief rather than a flat room backdrop.
cube('Art frame',(-1.5,3.34,2.17),(1.85,.06,1.3),dark,.012);cube('Art linen mount',(-1.5,3.3,2.17),(1.77,.025,1.22),trim,.002)
artmat=mat('Muted olive pigment',(.31,.32,.22),.95)
for k in range(3):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=(-1.8+k*.32,3.277,2.1+k*.09));o=bpy.context.object;o.name='Abstract relief';o.scale=(.27,.008,.4-k*.045);o.data.materials.append(artmat)
# Full-height curtains: continuous folded mesh, realistic woven normal maps.
for ycenter in [-1.08,2.8]:
 vertices=[];faces=[];nx=60;nz=35
 for iz in range(nz+1):
  z=.04+iz/nz*3.16
  for ix in range(nx+1):
   y=ycenter+(ix/nx-.5)*.58;x=3.49+math.sin(ix/nx*math.tau*5)*.042+math.sin(z*2+ix*.08)*.012
   vertices.append((x,y,z))
 for iz in range(nz):
  for ix in range(nx):a=iz*(nx+1)+ix;faces.append((a,a+1,a+nx+2,a+nx+1))
 me=bpy.data.meshes.new('Linen folds');me.from_pydata(vertices,[],faces);o=bpy.data.objects.new('Curtain',me);scene.collection.objects.link(o);me.materials.append(linen)
 uv=me.uv_layers.new(name='UVMap')
 for poly in me.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:
   vi=me.loops[li].vertex_index;uv.data[li].uv=((vi%(nx+1))/nx*5,(vi//(nx+1))/nz*18)
# A brass reading lamp with an opaque linen shade.
cyl('Lamp base',(-3.04,2,.045),.22,.06,brass);cyl('Lamp stem',(-3.04,2,.84),.015,1.6,brass)
cyl('Lamp shade',(-3.04,2,1.61),.24,.35,linen,.18)
# Load the real plant separately and keep it separate for runtime placement.
cube('ceiling',(0,0,3.48),(7.5,8,.12),plaster,.01)
roomObjects=list(scene.objects)
# Each foliage asset is separated from its original pot for real interchangeable planters.
def prepare_foliage(key,folder):
 before=set(scene.objects);bpy.ops.import_scene.gltf(filepath=str(OUT/folder/'model.gltf'));objects=list(set(scene.objects)-before)
 foliage=[]
 for o in objects:
  if o.type!='MESH':continue
  if key in ['calathea','pachira'] and not o.name.endswith('_b'):continue
  # Materials named pot belong to the scanned container, not to the foliage.
  keep=[i for i,m in enumerate(o.data.materials) if m and ('stem' in o.name.lower() or not any(t in m.name.lower() for t in ['_pot','soil','gravel']))]
  if not keep:continue
  import bmesh
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.material_index not in keep],context='FACES');bm.to_mesh(o.data);bm.free()
  if len(o.data.polygons):foliage.append(o)
 coords=[o.matrix_world@Vector(corner) for o in foliage for corner in o.bound_box]
 lo=min(v.z for v in coords);hi=max(v.z for v in coords);height=hi-lo
 root=bpy.data.objects.new(key+' foliage',None);scene.collection.objects.link(root)
 # Bake import hierarchy transforms then normalise foliage to one metre tall.
 for o in foliage:
  world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
  bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.select_set(False)
  for v in o.data.vertices:v.co=(o.matrix_world@v.co-Vector((0,0,lo)))/height
  o.matrix_world.identity();o.parent=root
  for poly in o.data.polygons:poly.use_smooth=True
 bpy.ops.object.select_all(action='DESELECT')
 for o in foliage+[root]:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(OUT/(key+'-foliage.glb')),export_format='GLB',use_selection=True,export_apply=True,export_tangents=True)
 for o in objects:
  if o not in foliage:bpy.data.objects.remove(o,do_unlink=True)
 root.hide_render=True
 for o in foliage:o.hide_render=True
 return root,foliage
models={}
for key,folder in [('arrow','plant'),('broadleaf','broadleaf'),('calathea','calathea'),('pachira','pachira')]:
 if (OUT/folder/'model.gltf').exists():models[key]=prepare_foliage(key,folder)
# Planters have real walls, a hollow opening and dark soil.
ceramic=mat('Warm-white ceramic',(.75,.72,.63),.42);charcoal=mat('Charcoal clay',(.055,.063,.053),.8);soil=mat('Potting soil',(.043,.028,.016),.98)
def planter(name,xy,height,radius,material):
 profile=[(0,0),(radius*.78,0),(radius*.82,.035*height),(radius,height*.94),(radius,height),(radius-.025,height),(radius-.028,height*.12),(0,height*.12)]
 vertices=[];faces=[];n=96
 for i in range(n):
  a=math.tau*i/n
  for r,z in profile:vertices.append((r*math.cos(a),r*math.sin(a),z))
 for i in range(n):
  for j in range(len(profile)-1):faces.append((i*len(profile)+j,((i+1)%n)*len(profile)+j,((i+1)%n)*len(profile)+j+1,i*len(profile)+j+1))
 me=bpy.data.meshes.new(name);me.from_pydata(vertices,[],faces);o=bpy.data.objects.new(name,me);scene.collection.objects.link(o);o.location=(*xy,0);me.materials.append(material)
 for p in me.polygons:p.use_smooth=True
 cyl('Soil',(*xy,height*.92),radius*.91,.025,soil)
 return o
placements=[('broadleaf',(1.65,1.75),1.55,.4495,.2607,ceramic),('arrow',(-2.9,-.35),.94,.2726,.1581,charcoal),('calathea',(.8,-.7),.83,.2407,.1396,ceramic)]
for key,xy,height,ph,pr,material in placements:
 if key not in models:continue
 root,foliage=models[key];root.hide_render=False
 for o in foliage:o.hide_render=False
 root.location=(*xy,ph*.93);root.scale=(height-ph*.93,)*3
 planter(key+' ceramic planter',xy,ph,pr,material)
# Light transport for a spacious contemporary living room.
def area(name,loc,target,power,size,color=(1,1,1)):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Window daylight',(4.5,.6,2.7),(-1,1,.5),1000,4,(1,.96,.89))
area('Soft room bounce',(0,-3,3),(0,1,1),350,5,(.94,.97,1))
bpy.ops.object.camera_add(location=(3.4,-5.5,2.2));cam=bpy.context.object;cam.name='Room camera';cam.rotation_euler=(Vector((-.05,1.1,1.1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=35;scene.camera=cam
bpy.ops.object.select_all(action='DESELECT')
for o in roomObjects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'room.glb'),export_format='GLB',use_selection=True,export_apply=True,export_tangents=True,export_lights=False,export_cameras=False)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'tools/modern-room-studio.blend'))
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'modern-room-render.png');bpy.ops.render.render(write_still=True)
print('MODERN_ROOM_COMPLETE',flush=True)
