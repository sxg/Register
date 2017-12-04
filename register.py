"""Registers data using BROCCOLI."""

import os
import scipy.io as sio
import numpy as np
import nibabel as nib
import hdf5storage

def main(args):
    """Runs registration using BROCCOLI."""

    # Variables
    tmp_path = args[1]
    broccoli_path = args[2]
    rtv_path = args[3]
    platform = args[4]
    device = args[5]
    img_path = args[6]
    img_name = args[7]
    anchor_path = args[8]
    anchor_name = args[9]
    output_path = args[10]
    if sys.platform == 'linux':
        opencl_path = args[11]
    else:
        opencl_path = '/'

    # Input validation for paths
    if not os.path.exists(broccoli_path):
        sys.exit('BROCCOLIPath')
    if not os.path.exists(rtv_path):
        sys.exit('RTVPath')
    if not os.path.exists(opencl_path):
        sys.exit('OpenCLPath')
    if not os.path.exists(tmp_path):
        sys.exit('TempPath')
    if not os.path.exists(img_path):
        sys.exit('ImagePath')
    if not os.path.exists(anchor_path):
        sys.exit('AnchorPath')
    if not os.path.exists(output_path):
        sys.exit('OutputPath')

    # Load the data
    img_data = hdf5storage.loadmat(img_path)
    anchor_data = hdf5storage.loadmat(anchor_path)

    # Validate the dataset names
    if not img_name in img_data:
        sys.exit('ImageName')
    if not anchor_name in anchor_data:
        sys.exit('AnchorName')

    # Load the datasets
    img = np.absolute(img_data[img_name])
    img = img / img.flatten().max()
    n_vols = img.shape[3]
    anchor_vol_list = np.squeeze(anchor_data[anchor_name]).tolist()
    if not isinstance(anchor_vol_list, list):
        anchor_vol_list = [anchor_vol_list]

    # Convert .mat to .nii
    mat_to_nii(img, tmp_path)

    # Register data
    register_data(broccoli_path, rtv_path, opencl_path, platform, device, tmp_path, anchor_vol_list, n_vols)

    # Load the registered data
    reg_img = load_reg_data(tmp_path, anchor_vol_list, img.shape)

    # Save the registered data to .mat
    output_path = os.path.join(output_path, 'registeredImages.mat')
    hdf5storage.savemat(output_path, {'registeredImages': reg_img})

    # Empty the temp folder
    files = [f for f in os.listdir(tmp_path)]
    for file in files:
        os.remove(os.path.join(tmp_path, file))


def register_volumes(rtv_path, platform, device, path, vol, anchor_vol):
    """Registers two volumes using BROCCOLI."""
    vol_path = os.path.join(path, '%d.nii' % (vol + 1))
    anchor_vol_path = os.path.join(path, '%d.nii' % (anchor_vol + 1))
    print('Registering %s to %s (anchor)' % (vol_path, anchor_vol_path))
    os.system('%s %s %s -iterationslinear 0 -platform %s -device %s' \
        % (rtv_path, vol_path, anchor_vol_path, platform, device))

def register_data(broccoli_path, rtv_path, opencl_path, platform, device, tmp_path, anchor_vol_list, n_vols):
    """Registers a dataset using BROCCOLI."""
    os.environ['BROCCOLI_DIR'] = broccoli_path + '/'
    if sys.platform == 'linux':
        os.environ['LD_LIBRARY_PATH'] = opencl_path + ':' + broccoli_path + '/code/BROCCOLI_LIB/clBLASLinux'
    last_unreg_vol = 0
    for anchor_vol in anchor_vol_list:
        for vol in range(last_unreg_vol, anchor_vol):
            register_volumes(rtv_path, platform, device, tmp_path, vol, anchor_vol)
        last_unreg_vol = anchor_vol + 1

        # Handle edge case where final volumes are registered to the last anchor
        if anchor_vol == anchor_vol_list[-1] and anchor_vol != (n_vols - 1):
            for vol in range(last_unreg_vol, n_vols):
                register_volumes(rtv_path, platform, device, tmp_path, vol, anchor_vol)

def load_reg_data(path, anchor_vol_list, shape):
    """Loads registered data from the given path."""
    reg_img = np.empty(shape=shape)
    for vol in range(0, shape[3]):
        vol_path = ''
        if vol in anchor_vol_list:
            vol_path = os.path.join(path, '%d.nii' % (vol + 1))
        else:
            vol_path = os.path.join(path, '%d_aligned_nonlinear.nii' % (vol + 1))
        reg_img[:, :, :, vol] = nib.load(vol_path).get_data()
    return reg_img

def mat_to_nii(img, tmp_path):
    """Save data as .nii volume files"""
    for i in range(0, img.shape[3]):
        vol_nii = nib.Nifti1Image(np.squeeze(img[:, :, :, i]), np.eye(4))
        vol_nii.to_filename(os.path.join(tmp_path, '%d.nii' % (i + 1)))

if __name__ == '__main__':
    import sys
    main(sys.argv)
