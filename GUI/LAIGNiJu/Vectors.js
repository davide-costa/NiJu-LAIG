/**
 * Vectors
 */
class Vectors
{
    //Returns a vector going from point p1 to p2. Its coordinates are given by [x2-x1, y2-y1, z2-z1]
    static GetVectorFromTwoPoints(p1, p2)
    {
        return Vectors.SubVectors(p2, p1);
    }

    //Returns a number representing the magnitude of the vector it receives as parameter
    static GetMagnitudeOfVector(vector)
    {
        var magnitude = 0;
        for (var i = 0; i < vector.length; i++)
        {
            magnitude += (vector[i] * vector[i]);
        }
        magnitude = Math.sqrt(magnitude);
        return magnitude;
    }

    //Normalizes a vector. Tranforms the vector ir receives as parameter into a versor. (A versor is a vector which has a magnitude of 1)
    static TransformVectorIntoVersor(vector)
    {
        //Tranform curr_sub_ref_x vector in a versor
        var magnitude = this.GetMagnitudeOfVector(vector);
        for (var i = 0; i < vector.length; i++)
        {
            vector[i] /= magnitude;
        }
    }

    //Scales the vector it receives as parameter, multiplying it by the scale_factor (the second parameter). It alters the content of the vector according to the sepecification.
    static ScaleVector(vector, scale_factor)
    {
        for (var i = 0; i < vector.length; i++)
        {
            vector[i] *= scale_factor;
        }
    }

    //Returns a new, independent vector that represents the vector it receives as parameter scaled, multiplying it by the scale_factor (the second parameter). It does not alter the contents of the vector (first parameter).
    static GetScaledVector(vector, scale_factor)
    {
        let scaled = [];
        this.CopyContent(scaled, vector);
        this.ScaleVector(scaled, scale_factor);
        return scaled;
    }

    //Adds the two vectors it receives as parameter and returns a new, independent vector that represents the sum of each coordinate of the vectors it receives as parameter. It does not alter the contents of the vectors (parameters).
    static AddVectors(vector1, vector2)
    {
        var result_vector = [];
        for (var i = 0; i < vector1.length; i++)
        {
            result_vector.push(vector1[i] + vector2[i]);
        }
        return result_vector;
    }

    //Subtracts the two vectors it receives as parameter and returns a new, independent vector that represents the subtraction of each coordinate of the vectors it receives as parameter. It does not alter the contents of the vectors (parameters).
    static SubVectors(vector1, vector2)
    {
        var result_vector = [];
        for (var i = 0; i < vector1.length; i++)
        {
            result_vector.push(vector1[i] - vector2[i]);
        }
        return result_vector;
    }

    //Returns a number representing the cross product between the two vectors it receives as parameter. It does not alter the contents of the vectors (parameters).
    static DotProduct(vector1, vector2)
    {
        var result = 0;
        for (var i = 0; i < vector1.length; i++)
        {
            result += vector1[i] * vector2[i];
        }
        return result;
    }

    //Calculates the dot product between the two vectors it receives as parameter and returns a new, independent vector that represents that dot product. It does not alter the contents of the vectors (parameters).
    static CrossProduct(vector1, vector2)
    {
        var result = [vector1[1] * vector2[2] - vector1[2] * vector2[1], vector1[2] * vector2[0] - vector1[0] * vector2[2], vector1[0] * vector2[1] - vector1[1] * vector2[0]]
        return result;
    }

    //Returns a number representing the magnitude of the vector that is the result of the cross product between two vectors
    static CrossProductMagnitude(vector1, vector2)
    {
        //a x b = |a| * |b| * sin(t); t = angulo entre a e b
        return GetMagnitudeOfVector(vector1) * GetMagnitudeOfVector(vector2) * Math.sin(GetAngleBetweenVectors(vector1, vector2));
    }

    //Returns a number representing the angle between the two vectors it receives as parameter.
    static GetAngleBetweenVectors(vector1, vector2)
    {
        var cos = this.DotProduct(vector1, vector2) / (this.GetMagnitudeOfVector(vector1) * this.GetMagnitudeOfVector(vector2));
        //Fix floating point number
        if (cos > 1)
            cos = 1;
        return Math.acos(cos);
    }

    //Copies the contents from vector v2 (second parameter) to vector v1 (first parameter). It does not alter the contents of vector v2.
    static CopyContent(v1, v2)
    {
        for (var i = 0; i < v2.length; i++)
        {
            v1[i] = v2[i];
        }
    }
}
