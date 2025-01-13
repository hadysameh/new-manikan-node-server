const getLimbCode = (customAxesCode) => {
  return `
my_dict = {
# Add your key-value pairs here
}
arm_bone_radian_angles = {  }
arm_bone_radian_angles['Y'] = math.radians( arm_bone_degree_angles['Y'] )
arm_bone_radian_angles['X'] = math.radians( arm_bone_degree_angles['X'])
arm_bone_radian_angles['Z'] = math.radians( arm_bone_degree_angles['Z'])
 
armature_obj = bpy.data.objects.get(armature_name)

# bpy.ops.object.mode_set(mode='POSE')
 
pose_bone = get_pose_bone(armature_name,bone_name=arm_bone_name)

pose_bone.rotation_mode = "QUATERNION"

pose_bone.rotation_quaternion = (1, 0, 0, 0)
bpy.context.view_layer.update()


local_y_rotation = mathutils.Quaternion(mathutils.Vector((0, 1, 0)), arm_bone_radian_angles['Z'])

bone_x_axis, bone_y_axis, bone_z_axis = get_bone_global_axes(armature_name, arm_bone_name)
# Convert the custom axis to the bone's local space
${customAxesCode}
# Create a quaternion rotation
quat_x_rotation =mathutils.Quaternion(custom_x_axis_local, arm_bone_radian_angles['X'])
quat_z_rotation =mathutils.Quaternion(custom_z_axis_local, arm_bone_radian_angles['Y'])

# Apply the rotation in the bone's local space
pose_bone.rotation_quaternion = quat_z_rotation @ quat_x_rotation  @local_y_rotation
bpy.context.view_layer.update()
    `;
};
const leftArmCustomAxesCode = `
custom_x_axis_local = bone_z_axis @ pose_bone.matrix.to_3x3().inverted()
custom_z_axis_local = bone_x_axis @ pose_bone.matrix.to_3x3().inverted()
    `;

const legPythonCode = (leftArmCustomAxesCode = `
my_dict = {
# Add your key-value pairs here
}
arm_bone_radian_angles = {  }
arm_bone_radian_angles['Y'] = math.radians( arm_bone_degree_angles['Y'] )
arm_bone_radian_angles['X'] = math.radians( arm_bone_degree_angles['X'])
arm_bone_radian_angles['Z'] = math.radians( arm_bone_degree_angles['Z'])
 
armature_obj = bpy.data.objects.get(armature_name)

# bpy.ops.object.mode_set(mode='POSE')
 
pose_bone = get_pose_bone(armature_name,bone_name=arm_bone_name)

pose_bone.rotation_mode = "QUATERNION"

pose_bone.rotation_quaternion = (1, 0, 0, 0)
bpy.context.view_layer.update()


local_y_rotation = mathutils.Quaternion(mathutils.Vector((0, 1, 0)), arm_bone_radian_angles['Z'])

bone_x_axis, bone_y_axis, bone_z_axis = get_bone_global_axes(armature_name, arm_bone_name)
# Convert the custom axis to the bone's local space
custom_x_axis_local = bone_x_axis @ pose_bone.matrix.to_3x3().inverted()
custom_z_axis_local = bone_z_axis @ pose_bone.matrix.to_3x3().inverted()
# Create a quaternion rotation
quat_x_rotation =mathutils.Quaternion(custom_x_axis_local, arm_bone_radian_angles['X'])
quat_z_rotation =mathutils.Quaternion(custom_z_axis_local, arm_bone_radian_angles['Y'])

# Apply the rotation in the bone's local space
pose_bone.rotation_quaternion = quat_z_rotation @ quat_x_rotation  @local_y_rotation
bpy.context.view_layer.update()
    `);
const pythonCodes = {
  'mixamorig:LeftArm.code': leftArmCustomAxesCode,
  'mixamorig:RightArm.code': leftArmCustomAxesCode,
  'mixamorig:LeftUpLeg.code': legPythonCode,
  'mixamorig:RightUpLeg.code': legPythonCode,
};
module.exports = pythonCodes;
