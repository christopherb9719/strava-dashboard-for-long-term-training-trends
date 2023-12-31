import GPy
import numpy as np

###### CODE TAKEN FROM GPY DOCUMENTATION AND ADAPTED ######
def calculateRegression(activities):
    #If there are no activities return an empty array - otherwise would crash app
    if len(activities) > 0:
        hr = [run['heart_rate'] for run in activities]
        avs = [run['average_pace'] for run in activities]
        end = len(activities)
        kernel = GPy.kern.RBF(input_dim=1, variance=1., lengthscale=1.)
        m = GPy.models.GPRegression(np.array(hr)[:end,None],np.array(avs)[:end,None], kernel)
        m.optimize('bfgs')
        pred_x = np.arange(min(hr),max(hr),0.01)
        f, u = m.predict(pred_x[:,None])
        line_coords = []
        i = 0
        while i < len(u):
            coords = {}
            coords['x'] = pred_x[i]
            coords['y'] = f[i][0]
            line_coords.append(coords.copy())
            i += 1

        return line_coords
    else:
        return []
