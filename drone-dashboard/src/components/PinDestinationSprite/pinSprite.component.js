import React from 'react'
import InlineSVG from 'svg-inline-react';

export default ({ baseColor }) => (
    <InlineSVG
        element="div"
        src={`
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
             width="907.000000pt" height="1280.000000pt" viewBox="0 0 907.000000 1280.000000"
             preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)">
            <path d="M4245 12794 c-1839 -119 -3296 -1064 -3913 -2539 -151 -360 -251
            -750 -303 -1186 -30 -244 -32 -686 -5 -914 98 -835 397 -1736 942 -2835 604
            -1220 1442 -2539 2540 -4000 319 -425 1011 -1307 1026 -1309 14 -2 676 838
            1021 1297 2406 3198 3633 5834 3508 7537 -80 1091 -470 1971 -1182 2672 -717
            706 -1688 1138 -2829 1259 -138 14 -674 26 -805 18z"
            >
                <animate
                    attributeType="XML"
                    attributeName="fill"
                    values="${baseColor};rgba(0, 0, 0, 0.0)"
                    dur="0.8s"
                    repeatCount="indefinite"
                />
            </path>
            </g>
            </svg>
        `}
    />
)
