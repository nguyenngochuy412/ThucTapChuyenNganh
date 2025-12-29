import { useEffect, useState } from "react";

const AddressDisplay = ({ coords, getAddressFn }) => {
    const [displayAddress, setDisplayAddress] = useState('Đang tải...');

    useEffect(() => {
        const fetchAddr = async () => {
            const result = await getAddressFn(coords);
            setDisplayAddress(result);
        };
        fetchAddr();
    }, [coords, getAddressFn]);

    return <span>{displayAddress}</span>;
};
export default AddressDisplay;