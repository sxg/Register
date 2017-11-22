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

    # Paths
    tmp_path = args[1]

    # Load and scale the data
    img = sio.loadmat(IMG_PATH)
    img = img['images'] * 1e7

    # Convert .mat to .nii
    n_frames = img.shape[3]
    for frame in range(0, n_frames):
        vol = np.squeeze(img[:, :, :, frame])
        vol_nii = nib.Nifti1Image(vol, np.eye(4))
        vol_nii.to_filename(os.path.join(tmp_path, '%d.nii' % (frame + 1)))

    # Register data to the last frame
    for frame in range(0, n_frames - 1):
        input_vol_path = os.path.join(tmp_path, '%d.nii' % (frame + 1))
        anchor_vol_path = os.path.join(tmp_path, '%d.nii' % (n_frames))
        os.system('%s %s %s -iterationslinear 0 -platform 0 -device 2'\
            % (RTV, input_vol_path, anchor_vol_path))
        os.remove(input_vol_path)

    # Load the registered data
    reg_img = np.empty(shape=img.shape)
    for frame in range(0, n_frames - 1):
        reg_vol_path = os.path.join(tmp_path, '%d_aligned_nonlinear.nii' % (frame + 1))
        reg_img[:, :, :, frame] = nib.load(reg_vol_path).get_data()
        os.remove(reg_vol_path)
    vol_path = os.path.join(tmp_path, '%d.nii' % n_frames)
    reg_img[:, :, :, -1] = nib.load(vol_path).get_data()
    os.remove(vol_path)

    # Save the registered data to .mat
    sio.savemat('/Users/Satyam/Downloads/registeredImages.mat', \
        {'registeredImages': reg_img})

if __name__ == '__main__':
    import sys
    main(sys.argv)
