import bpy,pathlib,math
from mathutils import Vector
OUT=pathlib.Path(__file__).resolve().parents[1]/'dist/real-assets'
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False;scene.render.resolution_x=340;scene.render.resolution_y=380;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.view_settings.view_transform='AgX';scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.75,.75,.75,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.5
for loc,power,size in [((2,-3,4),400,4),((-2,1,2),200,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,.7))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(2,-3,1.8));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.75))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=2.3;scene.camera=camera
ceramic=bpy.data.materials.new('Chalk ceramic');ceramic.diffuse_color=(.7,.67,.59,1);ceramic.use_nodes=True;ceramic.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.7,.67,.59,1)
for key in ['arrow','broadleaf','calathea','pachira']:
 before=set(scene.objects);bpy.ops.import_scene.gltf(filepath=str(OUT/(key+'-foliage.glb')));objs=list(set(scene.objects)-before);root=bpy.data.objects.new('Foliage',None);scene.collection.objects.link(root)
 for o in objs:
  if o.parent is None:o.parent=root
 root.location.z=.36;root.scale=(1.1,)*3
 bpy.ops.mesh.primitive_cone_add(vertices=96,radius1=.23,radius2=.29,depth=.39,location=(0,0,.195));pot=bpy.context.object;pot.data.materials.append(ceramic);bevel=pot.modifiers.new('Soft rim','BEVEL');bevel.width=.015;bevel.segments=3
 for face in pot.data.polygons:face.use_smooth=True
 scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/(key+'-thumb.png'));bpy.ops.render.render(write_still=True)
 for o in objs+[root,pot]:bpy.data.objects.remove(o,do_unlink=True)
print('THUMBNAILS_COMPLETE')
