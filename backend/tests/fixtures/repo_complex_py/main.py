def tangled(a, b, c, d, e, f, g):
    result = 0
    if a > 0:
        if b > 0:
            if c > 0:
                for i in range(d):
                    if i % 2 == 0:
                        result += 1
                    elif i % 3 == 0:
                        result += 2
                    elif i % 5 == 0:
                        result += 4
                    else:
                        result += 3
            elif c < 0:
                for j in range(e):
                    if j > 5:
                        result -= 1
                    elif j > 3:
                        result -= 2
                    elif j > 1:
                        result -= 4
                    else:
                        result -= 3
            else:
                result = -1
        elif b < 0:
            while f > 0:
                if g > 0:
                    result += g
                elif g < 0:
                    result -= 1
                else:
                    result = 0
                f -= 1
        else:
            result = 0
    elif a < 0:
        if b > 0:
            result = b
        elif b < 0:
            result = -b
        else:
            result = 1
    else:
        result = 42
    return result
