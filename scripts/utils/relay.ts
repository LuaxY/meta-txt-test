export async function relay(forwarder: any, request: any, signature: any) {
    // Validate request on the forwarder contract
    const valid = await forwarder.verify(request, signature);
    if (!valid) throw new Error(`Invalid request`);

    // Send meta-tx through relayer to the forwarder contract
    const gasLimit = (parseInt(request.gas) + 50000).toString();
    return await forwarder.execute(request, signature, { gasLimit });
}