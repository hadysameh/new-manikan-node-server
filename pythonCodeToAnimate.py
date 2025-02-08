import bpy
import threading
import socketio
import time
import queue
import math
import mathutils

armature_name = "Armature"

axis_indices = {
    "X": 0,
    "Y": 1,
    "Z": 2,
}


def reset_bone_rotation(pose_bone):
    pose_bone.rotation_euler[0] = 0
    pose_bone.rotation_euler[1] = 0
    pose_bone.rotation_euler[2] = 0
    bpy.context.view_layer.update()


def get_pose_bone(armature_name, bone_name):
    # Get the armature object
    arm_obj = bpy.data.objects[armature_name]

    # Ensure we're in pose mode
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")

    # Get the pose bone
    pose_bone = arm_obj.pose.bones[bone_name]
    return pose_bone


def get_bone_axes(armature_name, bone_name):
    """
    Extracts the local axes (X, Y, Z) of a bone from its transformation matrix.

    Parameters:
    - armature_name: str, name of the armature object.
    - bone_name: str, name of the bone.

    Returns:
    - tuple of Vectors: (local_x, local_y, local_z)
    """
    # Get the armature object and the pose bone
    armature = bpy.data.objects[armature_name]
    pose_bone = armature.pose.bones[bone_name]

    # Get the bone's transformation matrix in local space
    matrix = pose_bone.matrix

    # Extract the local axes
    local_x = matrix.col[0].xyz  # X-axis (1st column)
    local_y = matrix.col[1].xyz  # Y-axis (2nd column)
    local_z = matrix.col[2].xyz  # Z-axis (3rd column)

    return local_x, local_y, local_z


def get_bone_global_axes(armature_name, bone_name):

    # Get the armature object and the pose bone
    armature = bpy.data.objects[armature_name]
    pose_bone = armature.pose.bones[bone_name]
    global_bone_matrix = armature.matrix_world @ pose_bone.matrix
    bpy.context.view_layer.update()

    # Extract the axes (columns of the rotation part of the matrix)
    global_x_axis = global_bone_matrix.to_3x3()[0]
    global_y_axis = global_bone_matrix.to_3x3()[1]
    global_z_axis = global_bone_matrix.to_3x3()[2]

    return global_x_axis, global_y_axis, global_z_axis


def get_bone_world_axes(armature_name, bone_name):
    armature = bpy.data.objects[armature_name]
    pose_bone = armature.pose.bones[bone_name]

    global_matrix = armature.matrix_world @ pose_bone.matrix

    # Extract global axes from the matrix
    world_x_axis = global_matrix.to_3x3()[0]  # Global X axis
    world_y_axis = global_matrix.to_3x3()[1]  # Global Y axis
    world_z_axis = global_matrix.to_3x3()[2]  # Global Z axis

    return world_x_axis, world_y_axis, world_z_axis


def draw_bone_world_axes(armature_name, bone_name):
    world_x, world_y, world_z = get_bone_world_axes(armature_name, bone_name)
    draw_custom_axis(world_x, "world_x")
    draw_custom_axis(world_y, "world_y")
    draw_custom_axis(world_z, "world_z")


def animate_3_axis_limb(armature_name, arm_bone_name, arm_bone_degree_angles):
    code = arm_bone_degree_angles["code"]
    # print(code)
    exec(code)
    arm_bone_radian_angles = {}
    arm_bone_radian_angles["Y"] = math.radians(arm_bone_degree_angles["Y"])
    arm_bone_radian_angles["X"] = math.radians(arm_bone_degree_angles["X"])
    arm_bone_radian_angles["Z"] = math.radians(arm_bone_degree_angles["Z"])

    armature_obj = bpy.data.objects.get(armature_name)
    # bpy.ops.object.mode_set(mode='POSE')

    pose_bone = get_pose_bone(armature_name, bone_name=arm_bone_name)
    pose_bone.rotation_mode = "QUATERNION"

    pose_bone.rotation_quaternion = (1, 0, 0, 0)
    bpy.context.view_layer.update()

    local_y_rotation = mathutils.Quaternion(
        mathutils.Vector((0, 1, 0)), arm_bone_radian_angles["Z"]
    )
    bone_x_axis, bone_y_axis, bone_z_axis = get_bone_global_axes(
        armature_name, arm_bone_name
    )
    # Convert the custom axis to the bone's local space
    #  we want this to be dynamic
    custom_x_axis_local = bone_x_axis @ pose_bone.matrix.to_3x3().inverted()
    custom_z_axis_local = bone_z_axis @ pose_bone.matrix.to_3x3().inverted()
    # Create a quaternion rotation
    quat_x_rotation = mathutils.Quaternion(
        custom_x_axis_local, arm_bone_radian_angles["X"]
    )
    quat_z_rotation = mathutils.Quaternion(
        custom_z_axis_local, arm_bone_radian_angles["Y"]
    )
    # Apply the rotation in the bone's local space
    pose_bone.rotation_quaternion = quat_z_rotation @ quat_x_rotation @ local_y_rotation
    bpy.context.view_layer.update()


def animate_with_arduino_data(arduino_data):
    # that's what we want
    exec(arduino_data)
    # left_arm_bone_data = {}
    # right_arm_bone_data = {}
    # left_leg_bone_data = {}
    # right_leg_bone_data = {}

    # selected_armature = bpy.data.objects[armature_name]

    # for bone_name_and_axis, bone_axis_degree_angle in arduino_data.items():
    #     bone_name, bone_axis = bone_name_and_axis.split(".")[-2:]
    #     if bone_axis == "info":
    #         continue

    #     if bone_name not in selected_armature.pose.bones:
    #         continue

    #     selected_bone_in_pose_mode = selected_armature.pose.bones[bone_name]
    #     if bone_name == left_arm_bone_name:
    #         left_arm_bone_data[bone_axis] = bone_axis_degree_angle
    #     elif bone_name == right_arm_bone_name:
    #         right_arm_bone_data[bone_axis] = bone_axis_degree_angle
    #     if bone_name == left_leg_bone_name:
    #         left_leg_bone_data[bone_axis] = bone_axis_degree_angle
    #     elif bone_name == right_leg_bone_name:
    #         right_leg_bone_data[bone_axis] = bone_axis_degree_angle
    #     elif bone_axis != "code":
    #         selected_bone_in_pose_mode.rotation_mode = "XYZ"
    #         selected_bone_in_pose_mode.rotation_euler[axis_indices[bone_axis]] = (
    #             math.radians(bone_axis_degree_angle)
    #         )

    # is_to_animate_left_arm = all(
    #     key in left_arm_bone_data for key in ["X", "Y", "Z", "code"]
    # )
    # is_to_animate_left_leg = all(
    #     key in left_leg_bone_data for key in ["X", "Y", "Z", "code"]
    # )
    # is_to_animate_right_arm = all(
    #     key in right_arm_bone_data for key in ["X", "Y", "Z", "code"]
    # )
    # is_to_animate_right_leg = all(
    #     key in right_leg_bone_data for key in ["X", "Y", "Z", "code"]
    # )

    # if is_to_animate_left_arm:
    #     animate_3_axis_limb(armature_name, "mixamorig:LeftArm", left_arm_bone_data)

    # if is_to_animate_right_arm:
    #     animate_3_axis_limb(armature_name, "mixamorig:RightArm", right_arm_bone_data)
    # if is_to_animate_left_leg:
    #     animate_3_axis_limb(armature_name, "mixamorig:LeftUpLeg", left_leg_bone_data)

    # if is_to_animate_right_leg:
    #     animate_3_axis_limb(armature_name, "mixamorig:RightUpLeg", right_leg_bone_data)
