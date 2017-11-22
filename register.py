"""Registers data using BROCCOLI."""

import os
import scipy.io as sio
import numpy as np
import nibabel as nib

# Paths
RTV = '/Users/Satyam/Dropbox/Research/BROCCOLI/compiled/Bash/Mac/Release/RegisterTwoVolumes'
IMG_PATH = "/Users/Satyam/Dropbox/Research/Datasets/IBD/Bowel/images.mat"

def main(args):
    """Runs registration using BROCCOLI."""

    # Variables
    anchor_vol_list = [1, 8, 15, 21, 24, 33]
    tmp_path = args[1]

    # Load and scale the data
    img = sio.loadmat(IMG_PATH)
    img = img['images'] * 1e7
    n_vols = img.shape[3]

    # Convert .mat to .nii
    for vol in range(0, n_vols):
        vol_nii = nib.Nifti1Image(np.squeeze(img[:, :, :, vol]), np.eye(4))
        vol_nii.to_filename(os.path.join(tmp_path, '%d.nii' % (vol + 1)))

    # Register data
    last_unreg_vol = 0
    for anchor_vol in anchor_vol_list:
        for vol in range(last_unreg_vol, anchor_vol):
            register_volumes(tmp_path, vol, anchor_vol)
        last_unreg_vol = anchor_vol + 1

        if anchor_vol == anchor_vol_list[-1] and anchor_vol != (n_vols - 1):
            for vol in range(last_unreg_vol, n_vols):
                register_volumes(tmp_path, vol, anchor_vol)

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
    sio.savemat('/Users/Satyam/Downloads/registeredImages.mat', \
        {'registeredImages': reg_img})


def register_volumes(path, vol, anchor_vol):
    """Registers two volumes using BROCCOLI."""
    vol_path = os.path.join(path, '%d.nii' % (vol + 1))
    anchor_vol_path = os.path.join(path, '%d.nii' % (anchor_vol + 1))
    print('Registering %s to %s (anchor)' % (vol_path, anchor_vol_path))
    os.system('%s %s %s -iterationslinear 0 -platform 0 -device 2' \
        % (RTV, vol_path, anchor_vol_path))


if __name__ == '__main__':
    import sys
    main(sys.argv)
