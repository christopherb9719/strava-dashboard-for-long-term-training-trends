import GPy
import numpy as np
def calculateRegression(activities):
    hr = [run['heart_rate'] for run in activities]
    avs = [run['average_pace'] for run in activities]
    print("Values calculated")
    end = len(activities)
    #m = GPy.models.GPRegression(gr['heart_rates'], gr['average_pace'])
    kernel = GPy.kern.RBF(input_dim=1, variance=1., lengthscale=1.)
    m = GPy.models.GPRegression(np.array(hr)[:end,None],np.array(avs)[:end,None], kernel)
    print("m Calculted")
    m.optimize('bfgs')
    pred_x = np.arange(min(hr),max(hr),0.1)
    f, u = m.predict(pred_x[:,None])
    line_coords = []
    i = 0
    print("Starting loop")
    while i < len(u):
        coords = {}
        coords['x'] = pred_x[i]
        coords['y'] = f[i][0]
        line_coords.append(coords.copy())
        i += 1

    print("Line coords calculated")
    return line_coords
