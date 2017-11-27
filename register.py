"""Registers data using BROCCOLI."""

import os
import scipy.io as sio
import numpy as np
import nibabel as nib

# Paths
RTV = '/Users/Satyam/Dropbox/Research/BROCCOLI/compiled/Bash/Mac/Release/RegisterTwoVolumes'

def main(args):
    """Runs registration using BROCCOLI."""

    # Variables
    tmp_path = args[1]
    img_path = args[2]
    img_name = args[3]
    anchor_path = args[4]
    anchor_name = args[5]
    output_path = args[6]

    # Input validation for paths
    if not os.path.exists(RTV):
        sys.exit('RegisterTwoVolumes')
    if not os.path.exists(tmp_path):
        sys.exit('TempPath')
    if not os.path.exists(img_path):
        sys.exit('ImagePath')
    if not os.path.exists(anchor_path):
        sys.exit('AnchorPath')
    if not os.path.exists(output_path):
        sys.exit('OutputPath')

    # Load the data
    img_data = sio.loadmat(img_path)
    anchor_data = sio.loadmat(anchor_path)

    # Validate the dataset names
    if not img_name in img_data:
        sys.exit('ImageName')
    if not anchor_name in anchor_data:
        sys.exit('AnchorName')

    # Load the datasets
    img = img_data[img_name] * 1e7
    n_vols = img.shape[3]
    anchor_vol_list = np.squeeze(anchor_data[anchor_name])

    # Convert .mat to .nii
    mat_to_nii(img, tmp_path)

    # Register data
    register_data(anchor_vol_list, n_vols, tmp_path)

    # Load the registered data
    reg_img = np.empty(shape=img.shape)
    for vol in range(0, n_vols):
        vol_path = ''
        if vol in anchor_vol_list:
            vol_path = os.path.join(tmp_path, '%d.nii' % (vol + 1))
        else:
            vol_path = os.path.join(tmp_path, '%d_aligned_nonlinear.nii' % (vol + 1))
        reg_img[:, :, :, vol] = nib.load(vol_path).get_data()

    # Save the registered data to .mat
    sio.savemat(output_path, {'registeredImages': reg_img})


def register_volumes(path, vol, anchor_vol):
    """Registers two volumes using BROCCOLI."""
    vol_path = os.path.join(path, '%d.nii' % (vol + 1))
    anchor_vol_path = os.path.join(path, '%d.nii' % (anchor_vol + 1))
    print('Registering %s to %s (anchor)' % (vol_path, anchor_vol_path))
    os.system('%s %s %s -iterationslinear 0 -platform 0 -device 2' \
        % (RTV, vol_path, anchor_vol_path))

def register_data(anchor_vol_list, n_vols, tmp_path):
    """Registers a dataset using BROCCOLI."""
    last_unreg_vol = 0
    for anchor_vol in anchor_vol_list:
        for vol in range(last_unreg_vol, anchor_vol):
            register_volumes(tmp_path, vol, anchor_vol)
        last_unreg_vol = anchor_vol + 1

        # Handle edge case where final volumes are registered to the last anchor
        if anchor_vol == anchor_vol_list[-1] and anchor_vol != (n_vols - 1):
            for vol in range(last_unreg_vol, n_vols):
                register_volumes(tmp_path, vol, anchor_vol)

def mat_to_nii(img, tmp_path):
    """Save data as .nii volume files"""
    for i in range(0, img.shape[3]):
        vol_nii = nib.Nifti1Image(np.squeeze(img[:, :, :, i]), np.eye(4))
        vol_nii.to_filename(os.path.join(tmp_path, '%d.nii' % (i + 1)))

if __name__ == '__main__':
    import sys
    main(sys.argv)
